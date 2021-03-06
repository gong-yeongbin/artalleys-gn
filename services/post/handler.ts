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
  PostLike,
} from "../../src/entity/Entity";
import { Connection, getConnection, Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { PostBuilder } from "../../src/dto/PostDto";
import { PostOtherBuilder } from "../../src/dto/PostOther";
import { authorizeToken } from "../util/authorizer";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { uuid } from "uuidv4";
import { getUid } from "../util/util";
import { UserData } from "../../src/types/dataType";
import { PostFeedBuilder } from "../../src/dto/PostFeedDto";

const { BUCKET_SERVICE_ENDPOINT_URL, CLOUDFRONT_IMAGE } = process.env;

/**
 * @api {put}  /post/createPost     Create Post
 * @apiName Create Post
 * @apiGroup Post
 *
 * @apiParam (Header)   {string} AuthArization                                        Bearer Token
 * @apiParam (Body)     {number=1(sell), 2(buy), 3(business), 4(businessPost)} type  type
 * @apiParam (Body)     {number=CategoryCode} category                                category
 * @apiParam (Body)     {number=ConditionCode} condition                              condition
 * @apiParam (Body)     {String{30}} title                                            title
 * @apiParam (Body)     {String{300}} detail                                          detail
 * @apiParam (Body)     {Object} [location]                                           location
 * @apiParam (Body)     {Object} location.latitude                                    latitude
 * @apiParam (Body)     {Object} location.longitude                                   longitude
 * @apiParam (Body)     {Object} location.city                                        city
 * @apiParam (Body)     {number} [price]                                              price
 * @apiParam (Body)     {number} [number]                                             number
 * @apiParam (Body)     {boolean} nonNegotiablePriceYn                                Non-Negotiable Price
 * @apiParam (Body)     {boolean} [hide]                                              hide
 * @apiParam (Body)     {Array} [key]                                                 image key
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
   "image": ["sample1.jpg","sample2.jpg"]
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
  if (userEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }
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
  location.city = data.location.city;
  location.post = post;
  await locationRepository.save(location);

  for (let index in data.key) {
    await imageRepository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values({
        url: `${BUCKET_SERVICE_ENDPOINT_URL}/${data.key[index]}`,
        post: post,
      })
      .execute();

    // const originalImage: Buffer = Buffer.from(data.image[index], "base64");

    // await putObject(originalImage, `image/${fileName}.png`);
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
 * @apiParam (PathParam)  {number}  postId                                post id
 *
 *
 * @apiParamExample {json} Response
{
  "data": {
    "id": "52",
    "title": "apple watch1",
    "details": "It's new product.",
    "price": 1000666,
    "number": 1047484856,
    "viewCount": 6,
    "likeCount": 1,
    "url": [
      "d19j7dhfxgaxy7.cloudfront.net/image/a33578dd-3927-4e23-a658-9ed41b3e6f37.png"
    ],
    "location": {
      "latitude": 12.123,
      "longitude": 13.123
    },
    "type": "sell",
    "category": "Antiques & Collectibles",
    "condition": "Other (see descriptions)",
    "status": "active",
    "nonNegotiablePriceYn": true
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
    .leftJoinAndSelect("post.user", "user")
    .leftJoinAndSelect("user.image", "userimage")
    .leftJoinAndSelect("post.location", "postlocation")
    .leftJoinAndSelect("post.image", "image")
    .leftJoinAndSelect("post.type", "type")
    .leftJoinAndSelect("post.category", "category")
    .leftJoinAndSelect("post.status", "status")
    .leftJoinAndSelect("post.condition", "condition")
    .where("post.id = :id", { id: postId })
    .getOne();

  postEntity.viewCount = postEntity.viewCount + 1;
  await postRepository.save(postEntity);

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
 * @api {get}  /post/:postId/hidePost     hide Post
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

  await postRepository.save(postEntity);

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

/**
 * @api {get}  /post/:postId/getOtherPost     get other post
 * @apiName Get Other Post
 * @apiGroup Post
 * 
 * @apiParam (Header)     {string}  Authorization                                Bearer Token
 * @apiParam (QueryStringParam) {Number}[offset=0]                               offset
 * @apiParam (QueryStringParam) {Number}[limit=6]                               limit
 * @apiParam (QueryStringParam) {String=desc,asc} order                          order
 *
 * @apiParamExample response
{
  "data": [
    {
      "id": "27",
      "title": "test title",
      "details": "test details",
      "url": "d19j7dhfxgaxy7.cloudfront.net/image/341e2ce3-f415-456e-8f9c-b267779f170b.png"
    },
    {
      "id": "26",
      "title": "test title",
      "details": "test details",
      "url": "d19j7dhfxgaxy7.cloudfront.net/image/e386ca0b-e183-4d44-9327-938f184c19c2.png"
    },
    {
      "id": "25",
      "title": "test title",
      "details": "test details",
      "url": "d19j7dhfxgaxy7.cloudfront.net/image/c727f3da-d423-4746-87a4-f64229cd703b.png"
    }
  ],
  "_meta": {
    "offset": 1,
    "limit": 3,
    "order": "DESC",
    "totalCount": 6
  }
}
 **/

const getOtherPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: string = event.pathParameters["postId"];

  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const userRepository: Repository<User> = connection.getRepository(User);
  const { offset = 0, limit = 6, order = "DESC" } = event.queryStringParameters;
  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryOrder: "ASC" | "DESC" =
    order.toLocaleLowerCase() == "asc" ? "ASC" : "DESC";

  const userEntity: User = await userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.post", "post")
    .where("post.id =:id", { id: postId })
    .getOne();

  const postEntity: Post[] = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.user", "user")
    .leftJoinAndSelect("post.image", "image")
    .where("user.uid =:uid", { uid: userEntity.uid })
    .andWhere("post.id !=:id", { id: postId })
    .offset(queryOffset)
    .limit(queryLimit)
    .orderBy("post.createdAt", queryOrder)
    .getMany();

  const totalCount: number = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.user", "user")
    .where("user.uid =:uid", { uid: userEntity.uid })
    .andWhere("post.id !=:id", { id: postId })
    .getCount();

  const postDto: any = new PostOtherBuilder(
    postEntity,
    queryOffset,
    queryLimit,
    queryOrder,
    totalCount
  )
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(postDto),
  };
};

/**
 * @api {get}  /post/:postId/likePost     Like post
 * @apiName Like Post
 * @apiGroup Post
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (PathParam)  {number}  postId                                post id
 *
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
const likePost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const uid: string = userInfo.uid;
  const postId: number = Number(event.pathParameters["postId"]);

  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const postLikeRepository: Repository<PostLike> = connection.getRepository(
    PostLike
  );
  const userEntity: User = await userRepository.findOne({ uid: uid });

  const postEntity: Post = await postRepository.findOne({
    id: postId,
  });

  const postLikeEntity: PostLike = await postLikeRepository.findOne({
    user: userEntity,
    post: postEntity,
  });

  let postLike: PostLike = new PostLike();
  postLike.post = postEntity;
  postLike.user = userEntity;

  if (postLikeEntity == null) {
    await postLikeRepository.save(postLike);

    postEntity.likeCount = postEntity.likeCount + 1;
    await postRepository.save(postEntity);
  } else {
    await postLikeRepository.delete(postLike);

    postEntity.likeCount = postEntity.likeCount - 1;
    await postRepository.save(postEntity);
  }

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /post/getOtherProductsViewedALotByNeighbourhood     get Other Products Viewed A Lot By Neighbourhood
 * @apiName Get Other Products Viewed A Lot By Neighbourhood
 * @apiGroup Post 
 * 
 * @apiParam (QueryStringParam) {Number} mile                                    mile
 * @apiParam (QueryStringParam) {Number} latitude                                latitude
 * @apiParam (QueryStringParam) {Number} longitude                               longitude
 * @apiParam (QueryStringParam) {Number} offset                                   offset
 * @apiParam (QueryStringParam) {Number} limit                               limit

 * @apiParamExample response
{
  "data": [
    {
      "id": "68",
      "title": "apple watch1",
      "status": "active",
      "category": "Antiques & Collectibles",
      "price": 100000000,
      "url": "https://d19j7dhfxgaxy7.cloudfront.net/post/39489e5be288970c5437b7a94917f54038bb48ff.png",
      "likeCount": 0
    },
    {
      "id": "72",
      "title": "apple watch1",
      "status": "active",
      "category": "Antiques & Collectibles",
      "price": 100000000,
      "url": "https://d19j7dhfxgaxy7.cloudfront.net/post/39489e5be288970c5437b7a94917f54038bb48ff.png",
      "likeCount": 0
    },
    {
      "id": "69",
      "title": "apple watch1",
      "status": "reserved",
      "category": "Antiques & Collectibles",
      "price": 100000000,
      "url": "https://d19j7dhfxgaxy7.cloudfront.net/post/39489e5be288970c5437b7a94917f54038bb48ff.png",
      "likeCount": 0
    },
    {
      "id": "70",
      "title": "apple watch1",
      "status": "active",
      "category": "Antiques & Collectibles",
      "price": 100000000,
      "url": "https://d19j7dhfxgaxy7.cloudfront.net/post/39489e5be288970c5437b7a94917f54038bb48ff.png",
      "likeCount": 0
    },
    {
      "id": "71",
      "title": "apple watch1",
      "status": "active",
      "category": "Antiques & Collectibles",
      "price": 100000000,
      "url": "https://d19j7dhfxgaxy7.cloudfront.net/post/39489e5be288970c5437b7a94917f54038bb48ff.png",
      "likeCount": 0
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 0,
    "order": "DESC",
    "totalCount": 5
  }
}
 **/

const getOtherProductsViewedALotByNeighbourhood = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const {
    mile,
    latitude,
    longitude,
    offset,
    limit,
  } = event.queryStringParameters;
  const queryRadius: number = Number(mile) * 1.6093;
  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);

  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const distanceEntity: {
    postId;
    distance;
  }[] = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.location", "location")
    .select(
      "6371*acos(cos(radians(:latitude))*cos(radians(location.latitude))*cos(radians(location.longitude)-radians(:longitude))+sin(radians(:latitude))*sin(radians(location.latitude)))",
      "distance"
    )
    .addSelect("post.id", "postId")
    .having("distance <= :radius")
    .setParameters({
      latitude: latitude,
      longitude: longitude,
      radius: queryRadius,
    })
    .getRawMany();

  const postId: number[] = distanceEntity.map((value, index) => {
    return value.postId;
  });

  if (postId.length < 1) {
    postId.push(0);
  }

  const postEntity: [Post[], number] = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.image", "image")
    .leftJoinAndSelect("post.type", "type")
    .leftJoinAndSelect("post.category", "category")
    .leftJoinAndSelect("post.status", "status")
    .where("post.id IN (:postId)", { postId: postId })
    .andWhere("post.hide = false")
    .orderBy("post.viewCount", "DESC")
    .offset(queryOffset)
    .limit(queryLimit)
    .getManyAndCount();

  const feedDto: any = new PostFeedBuilder(
    postEntity[0],
    queryOffset,
    queryLimit,
    "DESC",
    postEntity[1]
  )
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(feedDto),
  };
};

const wrappedLikePost = middy(likePost)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
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
const wrappedGetOtherPost = middy(getOtherPost)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetOtherProductsViewedALotByNeighbourhood = middy(
  getOtherProductsViewedALotByNeighbourhood
)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
export {
  wrappedGetPost as getPost,
  wrappedCreatePost as createPost,
  wrappedDeletePost as deletePost,
  wrappedHidePost as hidePost,
  wrappedBoostPost as boostPost,
  wrappedGetOtherPost as getOtherPost,
  wrappedLikePost as likePost,
  wrappedGetOtherProductsViewedALotByNeighbourhood as getOtherProductsViewedALotByNeighbourhood,
};
