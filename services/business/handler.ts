import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import {
  Post,
  Image,
  Location,
  Business,
  BusinessCategory,
  User,
  BusinessLike,
  BusinessPost,
} from "../../src/entity/Entity";
import { Connection, Repository } from "typeorm";
import middy from "@middy/core";
import { authorizeToken } from "../util/authorizer";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { getUid } from "../util/util";
import { UserData } from "../../src/types/dataType";
import { uuid } from "uuidv4";
import { BusinessBuilder } from "../../src/dto/BusinessDto";

const { BUCKET_SERVICE_ENDPOINT_URL, CLOUDFRONT_IMAGE } = process.env;

/**
 * @api {put}  /business/createBusiness     Create Business
 * @apiName Create Business
 * @apiGroup Business
 *
 * @apiParam (Header) {string}  Authorization                             Bearer Token
 * @apiParam (Body)   {number}  businessCategoryCode                      business category code
 * @apiParam (Body)   {String{30}}  title                                 title
 * @apiParam (Body)   {String}  detailTitle                               detail title
 * @apiParam (Body)   {String} address                                    address
 * @apiParam (Body)   {Number} number                                     number
 * @apiParam (Body)   {number} startWorkingHours                          start working hours
 * @apiParam (Body)   {number} endWorkingHours                            end working hours
 * @apiParam (Body)   {Object} location                                   location
 * @apiParam (Body)   {Object} location.latitude                          latitude
 * @apiParam (Body)   {Object} location.longitude                         longitude
 * @apiParam (Body)   {Object} location.city                              city
 * @apiParam (Body)   {String} businessHoursInfo                          business hours info
 * @apiParam (Body)   {String} homepage                                   homepage url
 * @apiParam (Body)   {String{300}} details                               details
 * @apiParam (Body)     {Array} [key]                                     image key
 *
 *
 * @apiParamExample {json} Request Body
{
	"category": 5,
	"title": "business title",
	"detailTitle": "organic food",
	"address": "seoul jongro",
	"number": 1047484856,
	"startWorkingHours": 1130,
	"endWorkingHours": 2200,
	"businessHoursInfo":"test businessHoursInfo",
	"homepage":"www.testhomepage.com",
	"location": {
							"longitude": 12.123,
							"latitude": 13.123
						 },
	"details":"organic food test test test",
	"key": ["post/39489e5be288970c5437b7a94917f54038bb48ff.png"]
 }
 * @apiSuccess (200 OK) {String} NoContent                              Success
 **/
const createBusiness = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const userInfo: UserData = await getUid(event.headers["Authorization"]);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const businessRepository: Repository<Business> = connection.getRepository(
    Business
  );
  const businessCategoryRepository: Repository<BusinessCategory> = connection.getRepository(
    BusinessCategory
  );
  const locationRepository: Repository<Location> = connection.getRepository(
    Location
  );
  const imageRepository: Repository<Image> = connection.getRepository(Image);

  const data: any = JSON.parse(event.body);

  let {
    title,
    detailTitle,
    address,
    number,
    startWorkingHours,
    endWorkingHours,
    businessHoursInfo,
    homepage,
    details,
  }: Business = data;

  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });
  const businessCategory: BusinessCategory = await businessCategoryRepository.findOne(
    { id: data.category }
  );

  let business: Business = new Business();
  business.title = title;
  business.detailTitle = detailTitle;
  business.address = address;
  business.number = number;
  business.startWorkingHours = startWorkingHours;
  business.endWorkingHours = endWorkingHours;
  business.businessHoursInfo = businessHoursInfo;
  business.homepage = homepage;
  business.details = details;
  business.user = userEntity;
  business.category = businessCategory;
  await businessRepository.save(business);

  let location: Location = new Location();
  location.latitude = data.location.latitude;
  location.longitude = data.location.longitude;
  location.city = data.location.city;
  location.business = business;
  await locationRepository.save(location);

  for (let index in data.key) {
    await imageRepository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values({
        url: `${BUCKET_SERVICE_ENDPOINT_URL}/${data.key[index]}`,
        business: business,
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
 * @api {get}  /business/:postId/getBusiness     Get Business 
 * @apiName Get Business
 * @apiGroup Business
 *
 * @apiParam (Header)   {string}  Authorization                         Bearer Token
 * @apiParam (PathParam) {String} businessId                            business id
 *
 *
 * @apiParamExample {json} Response
{
  "data": {
    "id": "18",
    "title": "test title",
    "detailTitle": "organic food",
    "address": "seoul jongro",
    "number": 1047484856,
    "startWorkingHours": 0,
    "endWorkingHours": 0,
    "businessHoursInfo": "test businessHoursInfo",
    "homepage": "www.testhomepage.com",
    "details": "organic food test test test",
    "url": "d19j7dhfxgaxy7.cloudfront.net/image/ce4b4d7b-4384-4b65-99f7-23b765fba669.png",
    "category": "Beauty & Spas",
    "location": {
      "longitude": 12.123,
      "latitude": 13.123
    }
  }
}
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
const getBusiness = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: string = event.pathParameters["postId"];
  const connection = await getDatabaseConnection();
  const businessRepository = connection.getRepository(Business);

  const businessEntity: Business = await businessRepository
    .createQueryBuilder("business")
    .leftJoinAndSelect("business.location", "location")
    .leftJoinAndSelect("business.image", "image")
    .leftJoinAndSelect("business.category", "category")
    .where("business.id =:businessId", { businessId: postId })
    .getOne();

  if (businessEntity == null) {
    return {
      statusCode: 404,
      body: "null",
    };
  }

  const businessDto: any = new BusinessBuilder(businessEntity)
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(businessDto),
  };
};

/**
 * @api {get}  /business/:postId/likeBusiness     Like Business
 * @apiName Like Business
 * @apiGroup Business
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (PathParam)  {number}  postId                                post id
 *
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/

const likeBusiness = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const uid: string = userInfo.uid;
  const postId: number = Number(event.pathParameters["postId"]);

  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const businessRepository: Repository<Business> = connection.getRepository(
    Business
  );
  const businessLikeRepository: Repository<BusinessLike> = connection.getRepository(
    BusinessLike
  );
  const userEntity: User = await userRepository.findOne({ uid: uid });

  const businessEntity: Business = await businessRepository.findOne({
    id: postId,
  });

  if (businessEntity == null) {
    return {
      statusCode: 500,
      body: JSON.stringify("business null"),
    };
  }

  const postLikeEntity: BusinessLike = await businessLikeRepository.findOne({
    user: userEntity,
    business: businessEntity,
  });

  let businessLike: BusinessLike = new BusinessLike();
  businessLike.business = businessEntity;
  businessLike.user = userEntity;

  if (postLikeEntity == null) {
    businessEntity.likeCount = businessEntity.likeCount + 1;
    await businessLikeRepository.save(businessLike);
  } else {
    businessEntity.likeCount = businessEntity.likeCount - 1;
    await businessLikeRepository.delete(businessLike);
  }

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /business/:postId/deleteBusiness     delete business
 * @apiName Delete Business
 * @apiGroup Business
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 * @apiParam (PathParam)  {number}  postId                                post id
 *
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
const deleteBusiness = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const postId: number = Number(event.pathParameters["postId"]);

  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository("User");
  const businessRepository: Repository<Business> = connection.getRepository(
    "Business"
  );
  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });
  const businessEntity: Business = await businessRepository.findOne({
    id: postId,
    user: userEntity,
  });

  if (businessEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  await businessRepository.delete(businessEntity);

  return {
    statusCode: 200,
    body: "",
  };
};
// const createBusinessPost = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const userInfo: UserData = await getUid(event.headers["Authorization"]);
//   const connection: Connection = await getDatabaseConnection();
//   const userRepository: Repository<User> = connection.getRepository(User);
//   const businessPostRepository: Repository<BusinessPost> = connection.getRepository(
//     BusinessPost
//   );
//   const locationRepository: Repository<Location> = connection.getRepository(
//     Location
//   );
//   const imageRepository: Repository<Image> = connection.getRepository(Image);

//   const data: any = JSON.parse(event.body);

//   let { title = "", price = 0, number = 0, details }: BusinessPost = data;

//   const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });

//   let location: Location = new Location();
//   location.latitude = data.location.latitude;
//   location.longitude = data.location.longitude;
//   await locationRepository.save(location);

//   for (let index in data.image) {
//     await imageRepository
//       .createQueryBuilder()
//       .insert()
//       .into(Image)
//       .values({
//         url: `${BUCKET_SERVICE_ENDPOINT_URL}/image/${data.image[index]}`,
//         business: business,
//       })
//       .execute();

//     // const originalImage: Buffer = Buffer.from(data.image[index], "base64");

//     // await putObject(originalImage, `image/${fileName}.png`);
//   }

//   return {
//     statusCode: 200,
//     body: "",
//   };
// };

const wrappedGetBusiness = middy(getBusiness)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedCreateBusiness = middy(createBusiness)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedLikeBusiness = middy(likeBusiness)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedDeleteBusiness = middy(deleteBusiness)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
export {
  wrappedGetBusiness as getBusiness,
  wrappedCreateBusiness as createBusiness,
  wrappedLikeBusiness as likeBusiness,
  wrappedDeleteBusiness as deleteBusiness,
};
