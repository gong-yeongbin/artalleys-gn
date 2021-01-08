import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { Connection, Repository } from "typeorm";
import { getDatabaseConnection } from "./src/connection/Connection";
import { User } from "./src/entity/Entity";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "./services/util/authorizer";

const hello: APIGatewayProxyHandler = async (_context) => {
  // const connection: Connection = await getDatabaseConnection();
  // const userRepository: Repository<User> = connection.getRepository("User");
  // const userEntity: User[] = await userRepository.find();

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

const wrappedGetHello = middy(hello)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export { wrappedGetHello as hello };
