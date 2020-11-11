import { APIGatewayEvent, Context, ProxyResult, S3Event } from "aws-lambda";
import * as crypto from "crypto";
import * as jimp from "jimp";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Post } from "../../src/entity/Post";
import { PostImage } from "../../src/entity/PostImage";
import { PostLocation } from "../../src/entity/PostLocation";
import { putObject, getObject } from "../util/aws";

export const createPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);
  const postLocationRepository = connection.getRepository(PostLocation);
  const postImageRepository = connection.getRepository(PostImage);

  const uid: string = event.pathParameters["uid"];
  const data: any = JSON.parse(event.body);

  for (let index in data) {
    const originalImage = Buffer.from(data[index].image, "base64");
    const postId = crypto.createHash("md5").digest("hex");

    let {
      type,
      title,
      category,
      price = 0,
      descriptions,
      condition,
      number,
    }: Post = data[index];

    let post: Post = new Post();
    let postLocation: PostLocation = new PostLocation();
    let postImage: PostImage = new PostImage();

    postLocation.longtitude = data[index].location.longtitude;
    postLocation.latitude = data[index].location.latitude;
    await postLocationRepository.save(postLocation);

    post.postId = postId;
    post.type = type;
    post.title = title;
    post.category = category;
    post.price = price;
    post.descriptions = descriptions;
    post.condition = condition;
    post.number = number;
    post.location = postLocation;
    await postRepository.save(post);

    postImage.url = `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/${uid}/${postId}/origin.png`;
    postImage.post = post;
    let dbSave = await postImageRepository.save(postImage);

    if (dbSave !== null) {
      // await putObject(originalImage, `${uid}/${postId}/origin.png`);
    }
  }

  return {
    statusCode: 200,
    body: "",
  };
};

export const imageResize = async (
  event: S3Event,
  context: Context
): Promise<void> => {
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);
  const postImageRepository = connection.getRepository(PostImage);

  const imageKey: string = event.Records[0].s3.object.key;
  const uid: string = imageKey.split("/")[0];
  const postId: string = imageKey.split("/")[1];

  const imageObject: any = await getObject(imageKey);
  const imageBuffer: Buffer = imageObject.Body as Buffer;

  const postEntity: Post = await postRepository.findOne({ postId: postId });
  const postImage = new PostImage();

  postImage.url = `https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/${uid}/${postId}/resize.png`;
  postImage.post = postEntity;
  let dbSave = await postImageRepository.save(postImage);

  const resizeImageData = await (await jimp.read(imageBuffer)).resize(
    jimp.AUTO,
    360
  );

  if (dbSave !== null) {
    resizeImageData.getBuffer(jimp.MIME_PNG, async (err, resizeImage) => {
      await putObject(resizeImage, `${uid}/${postId}/resize.png`);
    });
  }
};
