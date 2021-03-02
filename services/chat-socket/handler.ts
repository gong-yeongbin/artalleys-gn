import { APIGatewayEvent, ProxyResult, Context } from "aws-lambda";
import { ApiGatewayManagementApi, AugmentedAIRuntime } from "aws-sdk";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Repository, Connection } from "typeorm";
import { User, Post, Chat } from "../../src/entity/Entity";
import { UserData } from "../../src/types/dataType";
import { getUid } from "../util/util";
import * as admin from "firebase-admin";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "../../services/util/authorizer";

export const onConnect = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connectionId = event.requestContext.connectionId;
  console.log("websocket connect ", connectionId);
  return {
    statusCode: 200,
    body: JSON.stringify(
      `Entering onConnect on connection id: ${connectionId}`
    ),
  };
};

export const onDisconnect = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connectionId: string = event.requestContext.connectionId;
  console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@ disconnection ", connectionId);

  return {
    statusCode: 200,
    body: "",
  };
};

export const onDefault = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  return {
    statusCode: 200,
    body: "",
  };
};

export const onSessionConnect = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connectionId = event.requestContext.connectionId;
  const data = JSON.parse(event.body);
  console.log("@@@@@@@@ ", data.message);
  console.log("@@@@@@@@ ", connectionId);
  // const api: ApiGatewayManagementApi = new ApiGatewayManagementApi({
  //   apiVersion: "2018-11-29",
  //   endpoint:
  //     event.requestContext.domainName + "/" + event.requestContext.stage,
  // });

  // await api
  //   .postToConnection({
  //     ConnectionId: connectionId,
  //     Data: JSON.stringify(connectionId),
  //   })
  //   .promise();

  return {
    statusCode: 200,
    body: "",
  };
};

export const onSendMessage = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  return {
    statusCode: 200,
    body: "",
  };
};

const { PROJECT_ID, PRIVATE_KEY, CLIENT_EMAIL } = process.env;

const onPush = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  let registrationToken =
    "eS0JLULT2ECUpl4sk0eBsL:APA91bGSJub1Tljc1YN94GNAWoCSNDFJVQQdAoaJmjjPXdViFyQpTA3Hc-KycXPArhqdhpbj06XWh8VXHFFxwBoqdTSpajV2jphnaHqsqEb1bTEf0BvU_w7mnlxhYNwjadGa62vCwDmw";
  //target_token은 푸시 메시지를 받을 디바이스의 토큰값입니다

  let message = {
    notification: {
      title: "",
      body: "",
    },
    token: registrationToken,
  };

  // admin
  //   .auth()
  //   .createCustomToken("fBkfeReSGtbhEA8yTBY39kuAeyr2")
  //   .then((customToken) => {
  //     // Send token back to client
  //     console.log("@@@@@@@@@@ ", customToken);
  //     message.token = customToken;
  //   })
  //   .catch((error) => {
  //     console.log("Error creating custom token:", error);
  //   });
  // const { postId, message } = JSON.parse(event.body);
  // const userInfo: UserData = await getUid(event.headers["Authorization"]);
  // const connection: Connection = await getDatabaseConnection();
  // const userRepository: Repository<User> = connection.getRepository(User);
  // const postRepository: Repository<Post> = connection.getRepository(Post);
  // const chatRepository: Repository<Chat> = connection.getRepository(Chat);
  // const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });
  // const postEntity: Post = await postRepository
  //   .createQueryBuilder("post")
  //   .leftJoinAndSelect("post.user", "user")
  //   .where("post.id = :postId", { postId: postId })
  //   .getOne();

  admin
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
      // let chat: Chat = new Chat();
      // chat.message = message;
      // chat.sendId = userEntity;
      // chat.receiveId = postEntity.user;
      // chat.post = postEntity;
      // await chatRepository.save(chat);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });

  return {
    statusCode: 200,
    body: JSON.stringify("postEntity"),
  };
};

const wrappedGetHello = middy(onPush)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export { wrappedGetHello as onPush };
