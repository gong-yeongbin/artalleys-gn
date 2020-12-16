import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

const { DB_HOST } = process.env;
export const hello: APIGatewayProxyHandler = async (_context) => {
  console.log(DB_HOST);
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message:
          "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!!",
      },
      null,
      2
    ),
  };
};
