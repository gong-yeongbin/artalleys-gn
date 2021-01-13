import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { Connection, Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { authorizeToken } from "../util/authorizer";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { User } from "../../src/entity/Entity";
import { getUid } from "../util/util";
import { UserData } from "../../src/types/dataType";

/**
 * @api {get}  /user/joinUser     Join User
 * @apiName Join User
 * @apiGroup User
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/

const joinUser = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);

  const userEntity: User = await userRepository.findOne({
    uid: userInfo.uid,
  });

  let user: User = new User();
  if (userEntity == null || userEntity == undefined) {
    user.uid = userInfo.uid;
    user.phoneNumber = userInfo.phoneNumber;
    await userRepository.save(user);
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify("be already joined"),
    };
  }

  return {
    statusCode: 200,
    body: "",
  };
};
const wrappedJoinUser = middy(joinUser)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
export { wrappedJoinUser as joinUser };
