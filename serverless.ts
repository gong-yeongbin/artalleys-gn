import { S3 } from "aws-sdk";
import type { Serverless } from "serverless/aws";
import { putObject } from "./services/util/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "artalleys-gn",
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  // Add the serverless-webpack plugin
  plugins: ["serverless-webpack", "serverless-offline"],
  provider: {
    name: "aws",
    stage: "prod",
    runtime: "nodejs12.x",
    region: "us-east-2",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: {
          "Fn::Join": ["", ["arn:aws:s3:::artalleys-gn-image-bucket", "/*"]],
        },
      },
    ],
  },
  functions: {
    hello: {
      handler: "handler.hello",
      events: [
        {
          http: {
            method: "get",
            path: "hello",
          },
        },
      ],
    },
    createPost: {
      handler: "services/post/createPost.createPost",
      events: [
        {
          http: {
            method: "put",
            path: "post/{uid}/createPost",
            cors: true,
          },
        },
      ],
    },
    imageResize: {
      handler: "services/post/createPost.imageResize",
      events: [
        {
          s3: {
            bucket: "artalleys-gn-image-bucket",
            event: "s3:ObjectCreated:*",
            rules: [],
            existing: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
