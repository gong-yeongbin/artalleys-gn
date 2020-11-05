import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { getDatabaseConnection } from "./src/connection/Connection";
import { User } from "./src/entity/User";

export const hello: APIGatewayProxyHandler = async (event, _context) => {
  const connection = await getDatabaseConnection();
  const userRepository = connection.getRepository(User);
  console.log(userRepository);
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
