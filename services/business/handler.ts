import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import * as crypto from "crypto";
import { Post } from "../../src/entity/Post";
import { Business } from "../../src/entity/Business";
import { BusinessImage } from "../../src/entity/BusinessImage";
import { PostLocation } from "../../src/entity/PostLocation";
import {
  putObject,
  getObject,
  deleteObject,
  deleteMessage,
  sendMessage,
} from "../util/aws";

export const createBusiness = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);
  const businessRepository = connection.getRepository(Business);
  const postLocationRepository = connection.getRepository(PostLocation);
  const businessImageRepository = connection.getRepository(BusinessImage);

  const uid: string = event.pathParameters["uid"];
  const postId: string = event.pathParameters["postId"];
  const businessId = crypto.randomBytes(10).toString("hex");
  const data: any = JSON.parse(event.body);

  let business: Business = new Business();
  let postLocation: PostLocation = new PostLocation();
  let businessImage: BusinessImage = new BusinessImage();

  let {
    title,
    detailTitle,
    address,
    number,
    workingHoursDescriptions,
    homepage,
    descriptions,
  }: Business = data;

  postLocation.longtitude = data.location.longtitude;
  postLocation.latitude = data.location.latitude;
  await postLocationRepository.save(postLocation);

  const postEntity: Post = await postRepository.findOne({ postId: postId });

  business.businessId = businessId;
  business.title = title;
  business.detailTitle = detailTitle;
  business.address = address;
  business.number = number;
  business.workingHoursDescriptions = workingHoursDescriptions;
  business.homepage = homepage;
  business.descriptions = descriptions;
  business.postLocation = postLocation;
  business.post = postEntity;
  await businessRepository.save(business);

  for (let index in data.image) {
    let imageName = crypto.randomBytes(10).toString("hex");

    await businessImageRepository
      .createQueryBuilder()
      .insert()
      .into(BusinessImage)
      .values({
        business: business,
        url: `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/${uid}/business/${businessId}/origin/${imageName}.png`,
      })
      .execute();

    const originalImage = Buffer.from(data.image[index], "base64");

    await putObject(
      originalImage,
      `${postId}/${businessId}/origin/${imageName}.png`
    );
    await sendMessage(`${uid}/business/${businessId}/origin/${imageName}.png`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(event),
  };
};
