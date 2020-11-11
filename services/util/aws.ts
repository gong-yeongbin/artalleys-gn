import * as AWS from "aws-sdk";

const { BUCKET_NAME } = process.env;

const s3: AWS.S3 = new AWS.S3();

export const putObject = async (data: Buffer, key: string) => {
  await s3
    .putObject({
      Bucket: BUCKET_NAME,
      Body: data,
      Key: key,
      ContentType: "image/png",
    })
    .promise();
};

export const getObject = async (key: string) => {
  return await s3
    .getObject({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    .promise();
};

export const deleteObject = async (key: string) => {
  await s3.deleteObject({ Bucket: BUCKET_NAME, Key: key }).promise();
};
