import { APIGatewayEvent, ProxyResult, Context } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Chat } from "../../src/entity/Entity";

//connection -> token userId , receiveId
export const onConnect = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connectionId = event.requestContext.connectionId;
  const connection = await getDatabaseConnection();
  const chatRepository = connection.getRepository(Chat);
  const chatEntity = await chatRepository
    .createQueryBuilder("Chat")
    .where("sendId = :sendId AND receiveId = :receveId", {
      sendId: "test1",
      receiveId: "test2",
    })
    .getOne();

  if (chatEntity == null) {
    const chat: Chat = new Chat();
    chat.connectionId = connectionId;
    chat.sendId = "test1";
    chat.receiveId = "test2";
    chatRepository.save(chat);
  } else if (chatEntity.connectionId != connectionId) {
    chatEntity.connectionId = connectionId;
    chatRepository.save(chatEntity);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(chatEntity),
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

export const onSendMessage = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  console.log("@@@ onSendMessage", event);
  const connection = await getDatabaseConnection();
  const chatRepository = connection.getRepository(Chat);
  const chatEntity = await chatRepository.findOne({
    sendId: "test1",
  });

  const api: ApiGatewayManagementApi = new ApiGatewayManagementApi({
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  await api
    .postToConnection({
      ConnectionId: "Wc6A5fc6CYcCF6g=",
      // ConnectionId: connectionId.S,
      Data: event.body,
    })
    .promise();

  return {
    statusCode: 200,
    body: "",
  };
};

export const onDisconnect = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  return {
    statusCode: 200,
    body: "",
  };
};
