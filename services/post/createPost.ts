import { APIGatewayEvent, Context, ProxyResult, S3Event } from "aws-lambda";
import * as crypto from "crypto";
import * as jimp from "jimp";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Post } from "../../src/entity/Post";
import { PostLocation } from "../../src/entity/PostLocation";
import { putObject, getObject } from "../util/aws";

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
    const postId = crypto.createHash("md5").digest("hex");

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
    await putObject(originalImage, `${uid}/${postId}/origin.png`);
    // https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/test/filename/origin.png
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
  event: S3Event,
  context: Context
): Promise<void> => {
  const imageKey: string = event.Records[0].s3.object.key;
  const uid: string = imageKey.split("/")[0];
  const postId: string = imageKey.split("/")[1];

  const imageObject: any = await getObject(imageKey);
  const imageBuffer: Buffer = imageObject.Body as Buffer;

  const resizeImageData = await (await jimp.read(imageBuffer)).resize(
    jimp.AUTO,
    360
  );

  resizeImageData.getBuffer(jimp.MIME_PNG, async (err, resizeImage) => {
    await putObject(resizeImage, `${uid}/${postId}/resize.png`);
  });
};
