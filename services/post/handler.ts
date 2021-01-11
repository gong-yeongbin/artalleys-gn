import {
  APIGatewayEvent,
  Context,
  ProxyResult,
  SQSEvent,
  SQSRecord,
} from "aws-lambda";
import * as jimp from "jimp";
import { name } from "../util/util";
import { getDatabaseConnection } from "../../src/connection/Connection";
import {
  putObject,
  getObject,
  deleteObject,
  deleteMessage,
  sendMessage,
} from "../util/aws";
import {
  Post,
  Location,
  Image,
  PostType,
  PostCategory,
  PostCondition,
  PostStatus,
} from "../../src/entity/Entity";
import { PostBuilder } from "../../src/dto/PostDto";
import { PostData } from "../../src/types/dataType";
import { getRepository, Connection, Repository } from "typeorm";
import { authorizeToken } from "../util/authorizer";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { uuid } from "uuidv4";

const { BUCKET_SERVICE_ENDPOINT_URL } = process.env;

/**
 * @api {put}  /post/createPost     Create Post
 * @apiName Create Post
 * @apiGroup Post
 *
 * @apiParam (Header)   {string}  AuthArization                             Bearer Token
 * @apiParam (Body)     {String="sell","buy","business"}  type              post type
 * @apiParam (Body)     {String{30}}  title                                 post title
 * @apiParam (Body)     {String} category                                   post category
 * @apiParam (Body)     {String} condition                                  post condition
 * @apiParam (Body)     {Object} [location]                                 post location(type: sell)
 * @apiParam (Body)     {Object} location.latitude                          post location latitude
 * @apiParam (Body)     {Object} location.longitude                        post location longitude
 * @apiParam (Body)     {number} [price]                                    post price
 * @apiParam (Body)     {boolean} firmOnPrice                               post firm on price
 * @apiParam (Body)     {number} [number]                                   post number(type: business)
 * @apiParam (Body)     {String{300}} descriptions                          post descriptions
 * @apiParam (Body)     {boolean} [hide]                                    post hide
 * @apiParam (Body)     {base64} image                                      post image
 *
 *
 * @apiParamExample {json} Request Body
 {
   "title": "hwajangpyoom",
   "type": "buy",
   "category":"hwajangpyoom category",
   "condition": "other",
   "location": {"latitude":"12.123","longitude":"13.123"},
   "price": 1000,
   "firmOnPrice": true,
   "number": 12312341234,
   "descriptions":"test hwajangpyoom e da",
   "hide": false,
   "image": ["testtesttesttest........"]
 }
 * @apiSuccess (200 OK) {String} NoContent                              Success
 **/

const createPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const postStatusRepository: Repository<PostStatus> = connection.getRepository(
    PostStatus
  );
  const postTypeRepository: Repository<PostType> = connection.getRepository(
    PostType
  );
  const postCategoryRepository: Repository<PostCategory> = connection.getRepository(
    PostCategory
  );
  const postConditionRepository: Repository<PostCondition> = connection.getRepository(
    PostCondition
  );
  const locationRepository: Repository<Location> = connection.getRepository(
    Location
  );
  const imageRepository: Repository<Image> = connection.getRepository(Image);

  const data: any = JSON.parse(event.body);
  let {
    title,
    details,
    price = 0,
    number = 0,
    nonNegotiablePriceYn = false,
  }: Post = data;

  const postStatusEntity: PostStatus = await postStatusRepository.findOne({
    id: 1,
  });
  const postTypeEntity: PostType = await postTypeRepository.findOne({
    id: data.type,
  });
  const postCategoryEntity: PostCategory = await postCategoryRepository.findOne(
    {
      id: data.category,
    }
  );
  const postConditionEntity: PostCondition = await postConditionRepository.findOne(
    {
      id: data.condition,
    }
  );


  let post: Post = new Post();
  post.status = postStatusEntity;
  post.type = postTypeEntity;
  post.category = postCategoryEntity;
  post.condition = postConditionEntity;
  post.title = title;
  post.details = details;
  post.price = price;
  post.number = number;
  post.nonNegotiablePriceYn = nonNegotiablePriceYn;

  await postRepository.save(post);

  let location: Location = new Location();
  location.latitude = data.location.latitude;
  location.longitude = data.location.longitude;
  location.post = post;
  await locationRepository.save(location);

  for (let index in data.image) {
    let fileName = uuid();
    await imageRepository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values({
        url: `${BUCKET_SERVICE_ENDPOINT_URL}/image/${fileName}.png`,
        post: post,
      })
      .execute();

    const originalImage: Buffer = Buffer.from(data.image[index], "base64");

    // await putObject(originalImage, `post/image/${fileName}.png`);
    // await sendMessage(`post/image/${fileName}.png`);
  }

  return {
    statusCode: 200,
    body: "",
  };
};

// /**
//  * @api {get}  /post/:postId/getPost     Get Post
//  * @apiName Get Post
//  * @apiGroup Post
//  *
//  * @apiParam (Header)     {string}  Authorization                         Bearer Token
//  * @apiParam (PathParam)  {String}  postId                                postId
//  *
//  *
//  * @apiParamExample {json} Response
//  {
//   "data": {
//     "postId": "9d6e2f86817916714223",
//     "type": "buy",
//     "category": "hwajangpyoom category",
//     "title": "hwajangpyoom",
//     "descriptions": "test hwajangpyoom e da",
//     "condition": "other",
//     "view": 0,
//     "number": null,
//     "price": 1000,
//     "active": "active",
//     "url": "d19j7dhfxgaxy7.cloudfront.net/testuid/post/9d6e2f86817916714223/origin/0fb98393c62f216e.png",
//     "location": {
//       "latitude": 12,
//       "longitude": 13
//     }
//   }
// }
//  * @apiSuccess  (200 OK) {String} NoContent           Success
//  * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
//  **/
const getPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: number = Number(event.pathParameters["postId"]);
  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);

  const postEntity: Post = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.location", "location")
    .leftJoinAndSelect("post.image", "image")
    .where("post.id = :id", { id: postId })
    .getOne();
  console.log(postEntity);
  if (postEntity == null) {
    return {
      statusCode: 404,
      body: "null",
    };
  }
  // const postDto: any = new PostBuilder(postEntity)
  //   .replaceHost(CLOUDFRONT_IMAGE)
  //   .build();

  return {
    statusCode: 200,
    body: JSON.stringify("postDto"),
  };
};

// /**
//  * @api {get}  /post/:postId/boostPost     boost Post
//  * @apiName Boost Post
//  * @apiGroup Post
//  *
//  * @apiParam (Header)     {string}  Authorization                         Bearer Token
//  * @apiParam (PathParam)  {String}  postId                                postId
//  *
//  *
//  * @apiSuccess  (200 OK) {String} NoContent           Success
//  * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
//  **/
const boostPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: number = Number(event.pathParameters["postId"]);

  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const postEntity: Post = await postRepository.findOne({
    id: postId,
  });
  postEntity.updatedAt = new Date();
  postRepository.save(postEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

// /**
//  * @api {get}  /post/:postId/getPost     hide Post
//  * @apiName Hide Post
//  * @apiGroup Post
//  *
//  * @apiParam (Header)     {string}  Authorization                         Bearer Token
//  * @apiParam (PathParam)  {String}  postId                                postId
//  *
//  *
//  * @apiSuccess  (200 OK) {String} NoContent           Success
//  * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
//  **/
const hidePost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: number = Number(event.pathParameters["postId"]);

  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const postEntity: Post = await postRepository.findOne({ id: postId });
  postEntity.hide === true
    ? (postEntity.hide = false)
    : (postEntity.hide = true);

  postRepository.save(postEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

// /**
//  * @api {get}  /post/:postId/deletePost     delete Post
//  * @apiName Delete Post
//  * @apiGroup Post
//  *
//  * @apiParam (Header)     {string}  Authorization                         Bearer Token
//  * @apiParam (PathParam)  {String}  postId                                postId
//  *
//  *
//  * @apiSuccess  (200 OK) {String} NoContent           Success
//  * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
//  **/
const deletePost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: number = Number(event.pathParameters["postId"]);

  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);

  const postEntity: Post = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.image", "image")
    .where("post.id = :id", { id: postId })
    .getOne();

  if (postEntity == null) {
    return {
      statusCode: 404,
      body: "",
    };
  }

//   for (let index in postEntity.image) {
//     let objecyKey: string = postEntity.image[index].url.replace(
//       "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/",
//       ""
//     );
//     await deleteObject(objecyKey);
//   }

  await postRepository.delete({id: postId});
    // .createQueryBuilder()
    // .delete()
    // .from(Post)
    // .where("id = :id", { id: postId })
    // .execute();

  return {
    statusCode: 200,
    body: "",
  };
};

// export const imageResize = async (
//   event: SQSEvent,
//   context: Context
// ): Promise<void> => {
//   for (let record of event.Records) {
//     const receiveData: string = record.body;
//     const type: string = receiveData.split("/")[1];
//     const id: string = receiveData.split("/")[2];

//     const connection = await getDatabaseConnection();
//     const postRepository = connection.getRepository(Post);
//     const imageRepository = connection.getRepository(Image);

//     const imageObject: any = await getObject(receiveData as string);
//     const imageBuffer: Buffer = imageObject.Body as Buffer;

//     let image: Image = new Image();
//     image.url = `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/${receiveData.replace(
//       "origin",
//       "resize"
//     )}`;

//     const postEntity: Post = await postRepository.findOne({ postId: id });
//     image.post = postEntity;

//     await imageRepository.save(image);

//     const resizeImageData: jimp = await (await jimp.read(imageBuffer)).resize(
//       jimp.AUTO,
//       360
//     );

//     resizeImageData.getBuffer(jimp.MIME_PNG, async (err, resizeImage) => {
//       await putObject(
//         resizeImage,
//         `${receiveData.replace("origin", "resize")}`
//       );
//     });

//     await deleteMessage(record.receiptHandle);
//   }
// };

const wrappedGetPost = middy(getPost).use(authorizeToken()).use(doNotWaitForEmptyEventLoop());
const wrappedCreatePost = middy(createPost)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedDeletePost = middy(deletePost).use(authorizeToken());
const wrappedHidePost = middy(hidePost).use(authorizeToken()).use(doNotWaitForEmptyEventLoop());;
const wrappedBoostPost = middy(boostPost).use(authorizeToken()).use(doNotWaitForEmptyEventLoop());;
export {
  wrappedGetPost as getPost,
  wrappedCreatePost as createPost,
  wrappedDeletePost as deletePost,
  wrappedHidePost as hidePost,
  wrappedBoostPost as boostPost,
};
