import { S3, SQS } from "aws-sdk";

const {
  BUCKET_NAME,
  BUCKET_SERVICE_ENDPOINT,
  SQS_IMAGE_RESIZE_ENDPOIN_URL,
  SQS_IMAGE_RESIZE_QUEUE_URL,
} = process.env;

const s3: S3 = new S3({
  region: "us-east-2",
  endpoint: BUCKET_SERVICE_ENDPOINT,
});

const sqs: SQS = new SQS({
  endpoint: SQS_IMAGE_RESIZE_ENDPOIN_URL,
  apiVersion: "2012-11-05",
});

export const putObject = async (data: Buffer, key: string): Promise<void> => {
  await s3
    .putObject({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: data,
      ContentType: "image/png",
    })
    .promise();
};

export const getObject = async (key: string): Promise<S3.GetObjectOutput> => {
  return await s3
    .getObject({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    .promise();
};

export const deleteObject = async (key: string): Promise<void> => {
  await s3.deleteObject({ Bucket: BUCKET_NAME, Key: key }).promise();
};

export const sendMessage = async (messageBody: string): Promise<void> => {
  await sqs
    .sendMessage({
      MessageBody: messageBody,
      QueueUrl: SQS_IMAGE_RESIZE_QUEUE_URL,
    })
    .promise();
};

export const deleteMessage = async (receiptHandle: string): Promise<void> => {
  await sqs
    .deleteMessage({
      QueueUrl: SQS_IMAGE_RESIZE_QUEUE_URL,
      ReceiptHandle: receiptHandle,
    })
    .promise();
};
