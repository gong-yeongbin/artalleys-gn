import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { putObject, sendMessage } from "../util/aws";
import { Post, Image, Location, PostBusiness } from "../../src/entity/Entity";
import { name } from "../util/util";
import { BusinessBuilder, BusinessData } from "../../src/dto/BusinessDto";
import { authorizeToken } from "../util/authorizer";
import * as middy from "middy";

const { CLOUDFRONT_IMAGE } = process.env;

/**
 * @api {put}  /post/createPost     Create Business Post
 * @apiName Create Business Post
 * @apiGroup Post
 *
 * @apiParam (Header) {string}  authorization                             Bearer Token
 * @apiParam (Body)   {String{30}}  title                                 title
 * @apiParam (Body)   {String }  detailTitle                               detailTitle
 * @apiParam (Body)   {Object} location                                   location
 * @apiParam (Body)   {Object} location.latitude                          location latitude
 * @apiParam (Body)   {Object} location.longtitude                        location longtitude
 * @apiParam (Body)   {String} address                                    address
 * @apiParam (Body)   {Number} number                                     number
 * @apiParam (Body)   {Object} workingHours                               workingHours
 * @apiParam (Body)   {Object} workingHours.start                         workingHours start
 * @apiParam (Body)   {Object} workingHours.end                           workingHours end
 * @apiParam (Body)   {String} workingHoursDescriptions                   workingHoursDescriptions
 * @apiParam (Body)   {String} homepage                                   homepage
 * @apiParam (Body)   {String{300}} descriptions                          post descriptions
 * @apiParam (Body)   {base64} image                                      post image
 *
 *
 * @apiParamExample {json} Request Body
{
	"title": "business title",
	"detailTitle": "organic food",
	"location": {
							"longtitude": 12.123,
							"latitude": 13.123
						 },
	"address": "seoul",
	"number": 2112341234,
  "workingHours": {
										"start": 1000,
										"end": 2200
									},
	"workingHoursDescriptions":"testestsetestts",
	"homepage":"www.asdf.com",
	"descriptions":"hahahahahahah",
	"image": ["testtesttesttest........"]
 }
 * @apiSuccess (200 OK) {String} NoContent                              Success
 **/
const createBusiness = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);
  const postBusinessRepository = connection.getRepository(PostBusiness);
  const imageRepository = connection.getRepository(Image);

  const postId = name(10);
  const data: any = JSON.parse(event.body);

  let post: Post = new Post();
  let postBusiness: PostBusiness = new PostBusiness();
  let location: Location = new Location();

  let { title, number }: Post = data;

  let {
    detailTitle,
    address,
    descriptions,
    workingHoursDescriptions,
    homepage,
  }: PostBusiness = data;

  location.longtitude = data.location.longtitude;
  location.latitude = data.location.latitude;

  post.postId = postId;
  post.title = title;
  post.number = number;
  post.location = location;
  await postRepository.save(post);

  postBusiness.detailTitle = detailTitle;
  postBusiness.address = address;
  postBusiness.startTime = data.workingHours.start;
  postBusiness.endTime = data.workingHours.end;
  postBusiness.descriptions = descriptions;
  postBusiness.workingHoursDescriptions = workingHoursDescriptions;
  postBusiness.homepage = homepage;
  // postBusiness.post = post;
  postBusinessRepository.save(postBusiness);

  for (let index in data.image) {
    let imageName = name(8);

    await imageRepository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values({
        post: post,
        url: `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/post/${postId}/origin/${imageName}.png`,
      })
      .execute();

    const originalImage = Buffer.from(data.image[index], "base64");

    await putObject(originalImage, `post/${postId}/origin/${imageName}.png`);
    await sendMessage(`post/${postId}/origin/${imageName}.png`);
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
 * @apiParam (Header)   {string}  authorization                         Bearer Token
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
    "longtitude": 12,
    "latitude": 13
  },
  "createdAt": "2020-11-16T22:50:32.965Z",
  "updatedAt": "2020-11-16T22:50:32.965Z"
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
  const postRepository = connection.getRepository(Post);
  const postEntity = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.business", "business")
    .leftJoinAndSelect("post.location", "location")
    .leftJoinAndSelect("post.postImage", "postImage")
    .where("post.postId = :postId", { postId: postId })
    .getOne();

  if (postEntity == null) {
    return {
      statusCode: 404,
      body: "null",
    };
  }

  const businessDto: BusinessData = new BusinessBuilder(postEntity)
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(businessDto),
  };
};

const wrappedGetBusiness = middy(getBusiness).use(authorizeToken());
const wrappedCreateBusiness = middy(createBusiness).use(authorizeToken());

export {
  wrappedGetBusiness as getBusiness,
  wrappedCreateBusiness as createBusiness,
};
