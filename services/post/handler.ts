import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import {
  putObject,
  getObject,
  deleteObject,
  deleteMessage,
  sendMessage,
} from "../util/aws";
import {
  User,
  Post,
  Location,
  Image,
  PostType,
  PostCategory,
  PostCondition,
  PostStatus,
} from "../../src/entity/Entity";
import { Connection, getConnection, Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { PostBuilder } from "../../src/dto/PostDto";
import { authorizeToken } from "../util/authorizer";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { uuid } from "uuidv4";
import { getUid } from "../util/util";
import { UserData } from "../../src/types/dataType";

const { BUCKET_SERVICE_ENDPOINT_URL, CLOUDFRONT_IMAGE } = process.env;

/**
 * @api {put}  /post/createPost     Create Post
 * @apiName Create Post
 * @apiGroup Post
 *
 * @apiParam (Header)   {string} AuthArization                                        Bearer Token
 * @apiParam (Body)     {number=1(sell), 2(buy), 3(business), 4(business post)} type  type
 * @apiParam (Body)     {number=CategoryCode} category                                category
 * @apiParam (Body)     {number=ConditionCode} condition                              condition
 * @apiParam (Body)     {String{30}} title                                            title
 * @apiParam (Body)     {String{300}} detail                                          detail
 * @apiParam (Body)     {Object} [location]                                           location
 * @apiParam (Body)     {Object} location.latitude                                    latitude
 * @apiParam (Body)     {Object} location.longitude                                   longitude
 * @apiParam (Body)     {number} [price]                                              price
 * @apiParam (Body)     {number} [number]                                             number
 * @apiParam (Body)     {boolean} nonNegotiablePriceYn                                Non-Negotiable Price
 * @apiParam (Body)     {boolean} [hide]                                              hide
 * @apiParam (Body)     {base64} image                                                image
 *
 *
 * @apiParamExample {json} Request Body
 {
   "type": 1,
   "category":1,
   "condition": 1,
	 "title": "test title",
	 "details":"test details",
   "location": {"latitude": 12.123,"longitude": 13.123},
   "price": 100000,
	 "number": 1047484856,
   "nonNegotiablePriceYn": true,
   "hide": false,
   "image":
   "image": ["test image ........"]
 }
 * @apiSuccess (200 OK) {String} NoContent                              Success
 **/

const createPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const userInfo: UserData = await getUid(event.headers["Authorization"]);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
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
  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });
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
  post.user = userEntity;

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

    await putObject(originalImage, `image/${fileName}.png`);
  }

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /post/:postId/getPost     Get Post
 * @apiName Get Post
 * @apiGroup Post
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (PathParam)  {number}  postId                                post id
 *
 *
 * @apiParamExample {json} Response
{
  "data": {
    "id": "19",
    "title": "test title",
    "details": "test detail",
    "viewCount": 0,
    "number": 0,
    "price": 100000,
    "url": [
      "d19j7dhfxgaxy7.cloudfront.net/image/0eb30f28-1223-4482-9873-17ce2f382777.png"
    ],
    "location": {
      "latitude": 12.123,
      "longitude": 13.123
    },
    "type": "sell",
    "category": "Antiques & Collectibles",
    "condition": "",
    "status": "active"
  }
}
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
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
    .leftJoinAndSelect("post.type", "type")
    .leftJoinAndSelect("post.category", "category")
    .leftJoinAndSelect("post.status", "status")
    .leftJoinAndSelect("post.condition", "condition")
    .where("post.id = :id", { id: postId })
    .getOne();

  if (postEntity == null) {
    return {
      statusCode: 404,
      body: "null",
    };
  }
  const postDto: any = new PostBuilder(postEntity)
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(postDto),
  };
};

/**
 * @api {get}  /post/:postId/boostPost     boost Post
 * @apiName Boost Post
 * @apiGroup Post
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (PathParam)  {number}  postId                                post id
 *
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
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

/**
 * @api {get}  /post/:postId/getPost     hide Post
 * @apiName Hide Post
 * @apiGroup Post
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (PathParam)  {number}  postId                                post id
 *
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
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

/**
 * @api {get}  /post/:postId/deletePost     delete Post
 * @apiName Delete Post
 * @apiGroup Post
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (PathParam)  {number}  postId                                post id
 *
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
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

  for (let index in postEntity.image) {
    let objecyKey: string = postEntity.image[index].url.replace(
      "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/",
      ""
    );
    await deleteObject(objecyKey);
  }

  await postRepository.delete({ id: postId });

  return {
    statusCode: 200,
    body: "",
  };
};

// const getOtherPost = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const connection: Connection = await getDatabaseConnection();
//   const postRepository: Repository<Post> = connection.getRepository(Post);
//   const postEntity: Post = await postRepository
//     .createQueryBuilder("post")
//     .leftJoinAndSelect("post.user", "user")
//     .getOne();
//   console.log(postEntity);
//   return {
//     statusCode: 200,
//     body: "",
//   };
// };

const wrappedGetPost = middy(getPost)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedCreatePost = middy(createPost)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedDeletePost = middy(deletePost).use(authorizeToken());
const wrappedHidePost = middy(hidePost)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedBoostPost = middy(boostPost)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
// const wrappedGetOtherPost = middy(getOtherPost)
//   .use(authorizeToken())
//   .use(doNotWaitForEmptyEventLoop());
export {
  wrappedGetPost as getPost,
  wrappedCreatePost as createPost,
  wrappedDeletePost as deletePost,
  wrappedHidePost as hidePost,
  wrappedBoostPost as boostPost,
  // wrappedGetOtherPost as getOtherPost,
};
