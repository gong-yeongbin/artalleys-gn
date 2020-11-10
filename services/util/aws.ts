import { SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER } from "constants";

import * as AWS from "aws-sdk";

const s3: AWS.S3 = new AWS.S3();

export const putObject = async (data: Buffer, key: string) => {
  await s3
    .putObject({
      Bucket: "artalleys-gn-image-bucket",
      Body: data,
      Key: key,
      ContentType: "image/png",
    })
    .promise();
};
