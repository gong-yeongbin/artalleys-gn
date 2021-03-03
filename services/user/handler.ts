import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { Connection, Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { authorizeToken } from "../util/authorizer";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { User, Post } from "../../src/entity/Entity";
import { getUid } from "../util/util";
import { UserData } from "../../src/types/dataType";
import { MySalesBuilder } from "../../src/dto/MySalesDto";

const { CLOUDFRONT_IMAGE } = process.env;

/**
 * @api {put}  /user/joinUser     Join User
 * @apiName Join User
 * @apiGroup User
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/

const joinUser = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
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

const getMyFavourites = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const connection: Connection = await getDatabaseConnection();
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
const wrappedGetMyFavourites = middy(getMyFavourites)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
export {
  wrappedJoinUser as joinUser,
  wrappedGetMySales as getMySales,
  wrappedGetMyFavourites as getMyFavourites,
};
