import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { Connection, Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { authorizeToken } from "../util/authorizer";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { User, Post, Image } from "../../src/entity/Entity";
import { getUid } from "../util/util";
import { UserData } from "../../src/types/dataType";
import { MySalesBuilder } from "../../src/dto/MySalesDto";
import { deleteObject } from "../util/aws";
import { replaceHost } from "../../services/util/http";

const { BUCKET_SERVICE_ENDPOINT_URL, CLOUDFRONT_IMAGE } = process.env;

/**
 * @api {get}  /user/getUserData     Get User Data
 * @apiName Get User Data
 * @apiGroup User
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiParamExample {json} Response Body
 {
  "id": "16",
  "uid": "wTYz5gmRuRTQ1W8HcdcsGCPAqO32",
  "nickName": "GN4",
  "phoneNumber": "+11234567890",
  "email": null,
  "distance": "20",
  "deviceToken": "e91LtMifTSGCM7mpqByd4p:APA91bE7w5Rzjdd47zfvWU9QdKu06dWyC7OX2SFt9FJHMq3bBI-cL0CLoHCAxV99Q0BtxGVoIMPOuS6MTSjdcUNh1dgv02aMi882TLa5oxQwazDQY2Kru6ndupb1MJ8JOnRDe_GZNyUR",
  "createdAt": "2021-03-08T18:27:26.908Z",
  "updatedAt": "2021-03-08T18:27:26.908Z",
  "image": {
    "id": "96",
    "url": "https://d19j7dhfxgaxy7.cloudfront.net/aaaaaaaaaaa"
  }
}
 **/

const getUserData = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const userEntity: User = await userRepository.findOne({
    where: { uid: userInfo.uid },
    relations: ["image"],
  });

  if (userEntity.image != null) {
    userEntity.image.url = replaceHost(userEntity.image.url, CLOUDFRONT_IMAGE);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(userEntity),
  };
};

/**
 * @api {put}  /user/joinUser     Join User
 * @apiName Join User
 * @apiGroup User
 *
 * @apiParam (Header)               {string}  Authorization                         Bearer Token
 * @apiParam (QueryStringParam)     {string}  deviceToken                           device token
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/

const joinUser = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const device_token: string = event.queryStringParameters["deviceToken"];
  const userInfo: UserData = await getUid(token);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);

  const userEntity: User = await userRepository.findOne({
    uid: userInfo.uid,
  });

  const totalCount: number = await userRepository.count();

  let user: User = new User();
  if (userEntity == null || userEntity == undefined) {
    user.uid = userInfo.uid;
    user.phoneNumber = userInfo.phoneNumber;
    user.nickName = `GN${totalCount + 1}`;
    user.deviceToken = device_token;
    await userRepository.save(user);
  } else {
    return {
      statusCode: 409,
      body: JSON.stringify("be already joined"),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(totalCount),
  };
};

/**
 * @api {patch}  /user/setDistance     Set Distance
 * @apiName Set Distance
 * @apiGroup User
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (QueryStringParam)     {number}  distance                    distance
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/

const setDistance = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const distance: number = Number(event.queryStringParameters["distance"]);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });

  userEntity.distance = distance;
  await userRepository.save(userEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {patch}  /user/setNickName     Set NickName
 * @apiName Set NickName
 * @apiGroup User
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (QueryStringParam)     {string}nickname                    nickname
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 **/
const setNickName = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const nickname: string = event.queryStringParameters["nickname"];
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });

  userEntity.nickName = nickname;
  await userRepository.save(userEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {patch}  /user/setProfileImage     Set Profile Image
 * @apiName Set Profile Image
 * @apiGroup User
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (Body)       {object}  key                                   s3 image key
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 **/
const setProfileImage = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const data: any = JSON.parse(event.body);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const imageRepository: Repository<Image> = connection.getRepository(Image);
  const userEntity: User = await userRepository
    .createQueryBuilder("user")
    .where("user.uid = :uid", { uid: userInfo.uid })
    .getOne();

  const imageEntity: Image = await imageRepository.findOne({
    user: userEntity,
  });

  if (imageEntity == null) {
    await imageRepository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values({
        url: `${BUCKET_SERVICE_ENDPOINT_URL}/${data.key}`,
        user: userEntity,
      })
      .execute();
  } else {
    let objecyKey: string = imageEntity.url.replace(
      "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/",
      ""
    );

    await deleteObject(objecyKey);

    imageEntity.url = `${BUCKET_SERVICE_ENDPOINT_URL}/${data.key}`;
    await imageRepository.save(imageEntity);
  }

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {post}  /user/getMySales     get my sales
 * @apiName Get My Sales
 * @apiGroup User
 *
 * @apiParam (Header)               {string}  Authorization                         Bearer Token
 * @apiParam (QueryStringParam)     {string}  offset                                offset
 * @apiParam (QueryStringParam)     {string}  limit                                 limit
 * @apiParam (Body)                 {Array=1and2,3}   status                        status 
 * @apiParam (Body)                 {boolean=true,false} hide                                  hide
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 * @apiParamExample {json} Request Body
{
	"status": [1,2],
	"hide": false
}
* @apiParamExample {json} Response Body
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
    },
    {
      "id": "72",
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
    "limit": 5,
    "totalCount": 5,
    "length": 5
  }
}
 **/
const getMySales = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const { offset, limit, order } = event.queryStringParameters;
  let queryOffset: number = Number(offset);
  let queryLimit: number = Number(limit);

  const data: any = JSON.parse(event.body);
  let { status, hide = false } = data;
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });

  const postEntity: [Post[], number] = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.category", "category")
    .leftJoinAndSelect("post.status", "status")
    .leftJoinAndSelect("post.image", "image")
    .where("status.id in (:status)", { status: status })
    .andWhere("post.user =:user", { user: userEntity.id })
    .andWhere("post.hide =:hide", { hide: hide })
    .offset(queryOffset)
    .limit(queryLimit)
    .getManyAndCount();

  const mySalesDto: any = new MySalesBuilder(
    postEntity[0],
    queryOffset,
    queryLimit,
    postEntity[1]
  )
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(mySalesDto),
  };
};

const setDeviceToken = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const deviceToken: string = event.queryStringParameters["deviceToken"];
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });

  userEntity.deviceToken = deviceToken;
  await userRepository.save(userEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

const wrappedJoinUser = middy(joinUser)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetMySales = middy(getMySales)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedSetDeviceToken = middy(setDeviceToken)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetUserData = middy(getUserData)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedSetDistance = middy(setDistance)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedSetNickName = middy(setNickName)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedSetProfileImage = middy(setProfileImage)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export {
  wrappedJoinUser as joinUser,
  wrappedGetMySales as getMySales,
  wrappedSetDeviceToken as setDeviceToken,
  wrappedGetUserData as getUserData,
  wrappedSetDistance as setDistance,
  wrappedSetNickName as setNickName,
  wrappedSetProfileImage as setProfileImage,
};
