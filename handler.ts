import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { getDatabaseConnection } from "./src/connection/Connection";
import { User } from "./src/entity/User";

const { DB_HOST } = process.env;
export const hello: APIGatewayProxyHandler = async (event, _context) => {
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
