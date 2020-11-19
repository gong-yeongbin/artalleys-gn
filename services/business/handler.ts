import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { putObject, sendMessage } from "../util/aws";
import { Post, Image, Location, PostBusiness } from "../../src/entity/Entity";
import { name } from "../util/util";
import { BusinessBuilder, BusinessData } from "../../src/dto/BusinessDto";

const { CLOUDFRONT_IMAGE } = process.env;

export const createBusiness = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);
  const postBusinessRepository = connection.getRepository(PostBusiness);
  const imageRepository = connection.getRepository(Image);

  const uid: string = event.pathParameters["uid"];
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
  post.postLocation = location;
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
    let imageName = name(8);

    await imageRepository
      .createQueryBuilder()
      .insert()
      .into(Image)
      .values({
        post: post,
        url: `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/${uid}/post/${postId}/origin/${imageName}.png`,
      })
      .execute();

    const originalImage = Buffer.from(data.image[index], "base64");

    await putObject(
      originalImage,
      `${uid}/post/${postId}/origin/${imageName}.png`
    );
    await sendMessage(`${uid}/post/${postId}/origin/${imageName}.png`);
  }

  return {
    statusCode: 200,
    body: "",
  };
};

export const getBusiness = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const uid: string = event.pathParameters["uid"];
  const postId: string = event.pathParameters["postId"];

  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);
  const postEntity = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.business", "business")
    .leftJoinAndSelect("post.postLocation", "postLocation")
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
