import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import * as crypto from "crypto";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Post } from "../../src/entity/Post";
import { PostLocation } from "../../src/entity/PostLocation";
import { putObject } from "../util/aws";

export const createPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  // const connection = await getDatabaseConnection();
  // const postRepository = connection.getRepository(Post);
  // const postLocationRepository = connection.getRepository(PostLocation);

  const uid: string = event.pathParameters["uid"];
  const data: any = JSON.parse(event.body);

  for (let index in data) {
    const fileName = crypto.createHash("md5").digest("hex");

    let post: Post = new Post();
    let postLocation: PostLocation = new PostLocation();

    postLocation.longtitude = data[index].location.longtitude;
    postLocation.latitude = data[index].location.latitude;
    // postLocationRepository.save(postLocation);

    let {
      type,
      title,
      category,
      price = 0,
      descriptions,
      condition,
      number,
    }: Post = data[index];

    post.type = type;
    post.title = title;
    post.category = category;
    post.price = price;
    post.descriptions = descriptions;
    post.condition = condition;
    post.number = number;
    post.location = postLocation;

    const originalImage = Buffer.from(data[index].image, "base64");
    // let dbSave = await postRepository.save(post);

    // if (dbSave !== null) {
    await putObject(originalImage, `${uid}/${fileName}/original.png`);
    // }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message:
          "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!!",
        input: event,
      },
      null,
      2
    ),
  };
};

export const imageResize = async (
  event: APIGatewayEvent,
  context: Context
): Promise<void> => {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!! imageResize");
};
