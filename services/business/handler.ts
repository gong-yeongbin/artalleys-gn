import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { putObject, sendMessage } from "../util/aws";
import { Post, Image, Location, PostBusiness } from "../../src/entity/Entity";
import { name } from "../util/util";
import { BusinessBuilder } from "../../src/dto/BusinessDto";
import { authorizeToken } from "../util/authorizer";
import { getRepository, Connection, Repository } from "typeorm";
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
 * @apiParam (Body)   {Object} location.longitude                        location longitude
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
							"longitude": 12.123,
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
  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const postBusinessRepository: Repository<PostBusiness> = connection.getRepository(
    PostBusiness
  );
  const imageRepository: Repository<Image> = connection.getRepository(Image);

  const postId: string = name(10);
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

  location.longitude = data.location.longitude;
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
  postBusiness.post = post;
  postBusinessRepository.save(postBusiness);

  for (let index in data.image) {
    let imageName: string = name(8);

    await imageRepository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values({
        post: post,
        url: `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/post/${postId}/origin/${imageName}.png`,
      })
      .execute();

    const originalImage: Buffer = Buffer.from(data.image[index], "base64");

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
  "data": {
    "postId": "3557ba5c30a1e6d54eca",
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
      "d19j7dhfxgaxy7.cloudfront.net/post/3557ba5c30a1e6d54eca/origin/0b84d60577798570.png"
    ],
    "location": {
      "longitude": 12,
      "latitude": 13
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

  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const postEntity: Post = await postRepository
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

  const businessDto: any = new BusinessBuilder(postEntity)
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
