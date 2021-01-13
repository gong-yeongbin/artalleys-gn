import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { putObject, sendMessage } from "../util/aws";
import {
  Post,
  Image,
  Location,
  Business,
  BusinessCategory,
  User,
} from "../../src/entity/Entity";
import { Connection, Repository } from "typeorm";
import middy from "@middy/core";
import { authorizeToken } from "../util/authorizer";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { getUid } from "../util/util";
import { UserData } from "../../src/types/dataType";
import { uuid } from "uuidv4";

const { BUCKET_SERVICE_ENDPOINT_URL } = process.env;

/**
 * @api {put}  /business/createPost     Create Business Post
 * @apiName Create Business Post
 * @apiGroup Business
 *
 * @apiParam (Header) {string}  Authorization                             Bearer Token
 * @apiParam (Body)   {number}  business category code                    business category code
 * @apiParam (Body)   {String{30}}  title                                 title
 * @apiParam (Body)   {String}  detailTitle                               detail title
 * @apiParam (Body)   {String} address                                    address
 * @apiParam (Body)   {Number} number                                     number
 * @apiParam (Body)   {number} startWorkingHours                          start working hours
 * @apiParam (Body)   {number} endWorkingHours                            end working hours
 * @apiParam (Body)   {Object} location                                   location
 * @apiParam (Body)   {Object} location.latitude                          latitude
 * @apiParam (Body)   {Object} location.longitude                         longitude
 * @apiParam (Body)   {String} businessHoursInfo                          business hours info
 * @apiParam (Body)   {String} homepage                                   homepage url
 * @apiParam (Body)   {String{300}} details                               details
 * @apiParam (Body)   {base64} image                                      post image
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
	"image": ["testtesttesttest........"]
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
  location.business = business;
  await locationRepository.save(location);

  for (let index in data.image) {
    let fileName: string = uuid();
    await imageRepository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values({
        url: `${BUCKET_SERVICE_ENDPOINT_URL}/image/${fileName}.png`,
        business: business,
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
 * @api {get}  /post/:postId/getBusiness     Get Business Post
 * @apiName Get Business Post
 * @apiGroup Post
 *
 * @apiParam (Header)   {string}  Authorization                         Bearer Token
 * @apiParam (PathParam) {String} postId                                postId
 *
 *
 * @apiParamExample {json} Response
{
  "postId": "4f62a7cb423ac3ff3faf",
  "title": "business title",
  "view": 0,
  "detailTitle": "organic food",
  "address": "seoul",
  "startTime": 1000,
  "endTime": 2200,
  "homePage": "www.asdf.com",
  "workingHoursDescriptions": "testestsetestts",
  "descriptions": "hahahahahahah",
  "url": [
    "d19j7dhfxgaxy7.cloudfront.net/testuid/post/4f62a7cb423ac3ff3faf/origin/65fe1202ae6419bd.png"
  ],
  "location": {
    "longitude": 12,
    "latitude": 13
  },
  "createdAt": "2020-11-16T22:50:32.965Z",
  "updatedAt": "2020-11-16T22:50:32.965Z"
}
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/
// const getBusiness = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const postId: string = event.pathParameters["postId"];

//   const connection = await getDatabaseConnection();
//   const postRepository = connection.getRepository(Post);
//   const postEntity = await postRepository
//     .createQueryBuilder("post")
//     .leftJoinAndSelect("post.business", "business")
//     .leftJoinAndSelect("post.location", "location")
//     .leftJoinAndSelect("post.postImage", "postImage")
//     .where("post.postId = :postId", { postId: postId })
//     .getOne();

//   if (postEntity == null) {
//     return {
//       statusCode: 404,
//       body: "null",
//     };
//   }

//   const businessDto: BusinessData = new BusinessBuilder(postEntity)
//     .replaceHost(CLOUDFRONT_IMAGE)
//     .build();

//   return {
//     statusCode: 200,
//     body: JSON.stringify(businessDto),
//   };
// };

// const wrappedGetBusiness = middy(getBusiness).use(authorizeToken());
// const wrappedCreateBusiness = middy(createBusiness).use(authorizeToken());

// export {
//   wrappedGetBusiness as getBusiness,
//   wrappedCreateBusiness as createBusiness,
// };

const wrappedCreateBusiness = middy(createBusiness)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
export { wrappedCreateBusiness as createBusiness };
