import { APIGatewayEvent, Context, ProxyResult, S3Event } from "aws-lambda";
import * as crypto from "crypto";
import * as jimp from "jimp";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Post } from "../../src/entity/Post";
import { PostImage } from "../../src/entity/PostImage";
import { PostLocation } from "../../src/entity/PostLocation";
import { putObject, getObject, deleteObject } from "../util/aws";

/**
 * @api {put}  /post/:uid/createPost     Create Post
 * @apiName Create Post
 * @apiGroup Post
 *
 * @apiParam (PathParam) {String} uid                                   uid
 * @apiParam (Body) {String{30}}  title                                 post title
 * @apiParam (Body) {String="sell","buy","business"}  type             post type
 * @apiParam (Body) {String} condition                                  post condition
 * @apiParam (Body) {Object} [location]                                 post location(type: sell)
 * @apiParam (Body) {Object} location.latitude                          post location latitude
 * @apiParam (Body) {Object} location.longtitude                        post location longtitude
 * @apiParam (Body) {number} [price]                                    post price
 * @apiParam (Body) {boolean} firmOnPrice                               post firm on price
 * @apiParam (Body) {number} [number]                                   post number(type: business)
 * @apiParam (Body) {String{300}} descriptions                          post descriptions
 * @apiParam (Body) {boolean} [hide]                                    post hide
 * @apiParam (Body) {base64} image                                      post image
 *
 *
 * @apiParamExample {json} Request Body
[
 {
   "title": "hwajangpyoom",
   "type": "buy",
   "category":"hwajangpyoom category",
   "condition": "other",
   "location": {"latitude":"12.123","longtitude":"13.123"},
   "price": 1000,
   "firmOnPrice": true,
   "number": 12312341234,
   "descriptions":"test hwajangpyoom e da",
   "hide": false,
   "image": "testtesttesttest........"
 }
]
 * @apiSuccess (200 OK) {String} NoContent                              Success
 **/

export const createPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);
  const postLocationRepository = connection.getRepository(PostLocation);
  const postImageRepository = connection.getRepository(PostImage);

  const uid: string = event.pathParameters["uid"];
  const data: any = JSON.parse(event.body);

  for (let index in data) {
    const originalImage = Buffer.from(data[index].image, "base64");
    const postId = crypto.randomBytes(15).toString("hex");

    let {
      type,
      title,
      category,
      price = 0,
      firmOnPrice = false,
      descriptions,
      condition,
      number,
    }: Post = data[index];

    let post: Post = new Post();
    let postLocation: PostLocation = new PostLocation();
    let postImage: PostImage = new PostImage();

    postLocation.longtitude = data[index].location.longtitude;
    postLocation.latitude = data[index].location.latitude;
    await postLocationRepository.save(postLocation);

    post.postId = postId;
    post.type = type.toLowerCase();
    post.title = title;
    post.category = category.toLowerCase();
    post.price = price;
    post.firmOnPrice = firmOnPrice;
    post.descriptions = descriptions;
    post.condition = condition.toLowerCase();
    post.number = number;
    post.postLocation = postLocation;
    await postRepository.save(post);

    postImage.url = `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/${uid}/${postId}/origin.png`;
    postImage.post = post;
    let dbSave = await postImageRepository.save(postImage);

    if (dbSave != null) {
      await putObject(originalImage, `${uid}/${postId}/origin.png`);
    }
  }

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /post/:uid/:postId/getPost     Get Post
 * @apiName Get Post
 * @apiGroup Post
 *
 * @apiParam (PathParam) {String} uid                                   uid
 * @apiParam (PathParam) {String} postId                                postId
 *
 *
 * @apiParamExample {json} Response
 {
  "id": "56",
  "postId": "aafde3c18d762d3c03ca0943b9cfe6",
  "type": "buy",
  "title": "hwajangpyoom",
  "category": "hwajangpyoom category",
  "price": 0,
  "firmOnPrice": false,
  "descriptions": "test hwajangpyoom e da",
  "condition": "other",
  "view": 0,
  "number": null,
  "active": "active",
  "hide": false,
  "createdAt": "2020-11-10T22:00:07.315Z",
  "updatedAt": "2020-11-10T22:00:07.315Z",
  "postLocation": {
    "id": "49",
    "longtitude": 13,
    "latitude": 12,
    "createdAt": "2020-11-10T22:00:07.285Z",
    "updatedAt": "2020-11-10T22:00:07.000Z"
  },
  "postImage": []
}
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
export const getPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const uid: string = event.pathParameters["uid"];
  const postId: string = event.pathParameters["postId"];

  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);
  const postEntity = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.postLocation", "postLocation")
    .leftJoinAndSelect("post.postImage", "postImage")
    .where("post.postId = :postId", { postId: postId })
    .getOne();

  if (postEntity == null) {
    return {
      statusCode: 404,
      body: "null",
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(postEntity),
  };
};

/**
 * @api {get}  /post/:uid/:postId/boostPost     boost Post
 * @apiName Boost Post
 * @apiGroup Post
 *
 * @apiParam (PathParam) {String} uid                                   uid
 * @apiParam (PathParam) {String} postId                                postId
 *
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
export const boostPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const uid: string = event.pathParameters["uid"];
  const postId: string = event.pathParameters["postId"];

  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);

  await postRepository
    .createQueryBuilder()
    .update(Post)
    .set({
      updatedAt: Date,
    })
    .where("postId = :postId", { postId: postId })
    .execute();

  return {
    statusCode: 200,
    body: "",
  };
};
/**
 * @api {get}  /post/:uid/:postId/getPost     hide Post
 * @apiName Hide Post
 * @apiGroup Post
 *
 * @apiParam (PathParam) {String} uid                                   uid
 * @apiParam (PathParam) {String} postId                                postId
 *
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
export const hidePost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const uid: string = event.pathParameters["uid"];
  const postId: string = event.pathParameters["postId"];

  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);

  await postRepository
    .createQueryBuilder()
    .update(Post)
    .set({
      hide: true,
    })
    .where("postId = :postId", { postId: postId })
    .execute();

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /post/:uid/:postId/deletePost     delete Post
 * @apiName Delete Post
 * @apiGroup Post
 *
 * @apiParam (PathParam) {String} uid                                   uid
 * @apiParam (PathParam) {String} postId                                postId
 *
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
export const deletePost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const uid: string = event.pathParameters["uid"];
  const postId: string = event.pathParameters["postId"];

  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);

  const postEntity = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.postImage", "postImage")
    .where("post.postId = :postId", { postId: postId })
    .getOne();

  if (postEntity == null) {
    return {
      statusCode: 404,
      body: "",
    };
  }

  for (let index in postEntity.postImage) {
    let objecyKey = postEntity.postImage[index].url.replace(
      "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/",
      ""
    );
    await deleteObject(objecyKey);
  }

  await postRepository
    .createQueryBuilder()
    .delete()
    .from(Post)
    .where("postId = :postId", { postId: postId })
    .execute();

  return {
    statusCode: 200,
    body: "",
  };
};
export const imageResize = async (
  event: S3Event,
  context: Context
): Promise<void> => {
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);
  const postImageRepository = connection.getRepository(PostImage);

  const imageKey: string = event.Records[0].s3.object.key;
  const uid: string = imageKey.split("/")[0];
  const postId: string = imageKey.split("/")[1];

  const imageObject: any = await getObject(imageKey);
  const imageBuffer: Buffer = imageObject.Body as Buffer;

  const postEntity: Post = await postRepository.findOne({ postId: postId });
  const postImage = new PostImage();

  postImage.url = `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/${uid}/${postId}/resize.png`;
  let dbSave = await postImageRepository.save(postImage);

  const resizeImageData = await (await jimp.read(imageBuffer)).resize(
    jimp.AUTO,
    360
  );

  if (dbSave !== null) {
    resizeImageData.getBuffer(jimp.MIME_PNG, async (err, resizeImage) => {
      await putObject(resizeImage, `${uid}/${postId}/resize.png`);
    });
  }
};
