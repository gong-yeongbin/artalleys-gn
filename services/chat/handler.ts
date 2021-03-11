import { APIGatewayEvent, ProxyResult, Context } from "aws-lambda";
import { ApiGatewayManagementApi, AugmentedAIRuntime } from "aws-sdk";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Repository, Connection, getRepository, In } from "typeorm";
import { User, Post, ChatRoom, Chat } from "../../src/entity/Entity";
import { UserData } from "../../src/types/dataType";
import { getUid, sendPush } from "../util/util";
import * as admin from "firebase-admin";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "../util/authorizer";
import { getOtherProductsViewedALotByNeighbourhood } from "../post/handler";

/**
 * @api {put}  /chat/createRoom     Create Room
 * @apiName Create Room
 * @apiGroup Chat
 *
 * @apiParam (Header)            {string}  Authorization                         Bearer Token
 * @apiParam (QueryStringParam)  {number}  postId                                post id
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 **/
const createRoom = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: number = Number(event.queryStringParameters["postId"]);
  const userInfo: UserData = await getUid(event.headers["Authorization"]);
  const connection: Connection = await getDatabaseConnection();

  const userRepository: Repository<User> = connection.getRepository(User);
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const chatRoomRepository: Repository<ChatRoom> = connection.getRepository(
    ChatRoom
  );
  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });
  const postEntity: Post = await postRepository.findOne({ id: postId });

  if (userEntity == null || postEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  let chatRoom: ChatRoom = new ChatRoom();
  chatRoom.post = postEntity;
  chatRoom.user = userEntity;
  await chatRoomRepository.save(chatRoom);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {put}  /chat/onSendMessage     send message
 * @apiName Send Message
 * @apiGroup Chat
 *
 * @apiParam (Header)            {string}  Authorization                         Bearer Token
 * @apiParam (Body)               {object}  postId                                post id
 * @apiParam (Body)               {object}  message                               message
 * @apiParamExample Request
{
	"postId": 69,
	"message": "test message"
}
 * @apiSuccess  (200 OK) {String} NoContent           Success
 **/
const onSendMessage = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const { postId, message } = JSON.parse(event.body);
  const userInfo: UserData = await getUid(event.headers["Authorization"]);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const postRepository: Repository<Post> = connection.getRepository(Post);
  const chatRepository: Repository<Chat> = connection.getRepository(Chat);
  const chatRoomRepository: Repository<ChatRoom> = connection.getRepository(
    ChatRoom
  );
  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });
  const postEntity: Post = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.user", "user")
    .leftJoinAndSelect("post.chatRoom", "chatRoom")
    .where("post.id = :postId", { postId: postId })
    .getOne();

  const chatRoomEntity: ChatRoom = await chatRoomRepository.findOne({
    where: {
      post: postEntity.id,
      user: userEntity.id,
    },
    relations: ["post", "user"],
  });

  let messageData = {
    data: { type: "chat", message: message },
    notification: {
      title: "good neibors",
      body: "",
    },
    token: postEntity.user.deviceToken,
  };

  const result: boolean = await sendPush(messageData);

  if (result) {
    let chat: Chat = new Chat();
    chat.message = message;
    chat.user = userEntity;
    chat.chatRoom = chatRoomEntity;
    await chatRepository.save(chat);
  }

  return {
    statusCode: 200,
    body: "",
  };
};

const getChatRoomList = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const userInfo: UserData = await getUid(event.headers["Authorization"]);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const chatRepository: Repository<Chat> = connection.getRepository(Chat);
  const chatRoomRepository: Repository<ChatRoom> = connection.getRepository(
    ChatRoom
  );

  const userEntity: User = await userRepository.findOne({
    where: {
      uid: userInfo.uid,
    },
    relations: ["chatRoom"],
  });

  const chatRoomIdList: number[] = userEntity.chatRoom.map((value, index) => {
    return value.id;
  });

  // const chatEntity: Chat[] = await chatRepository.find({
  //   where: { chatRoom: In(chatRoomIdList) },
  //   order: { createdAt: "DESC" },
  //   relations: ["chatRoom"],
  // });
  const chatRoomEntity: ChatRoom[] = await chatRoomRepository
    .createQueryBuilder("chatRoom")
    .leftJoinAndSelect("chatRoom.chat", "chat")
    .where("chatRoom.id In (:roomId)", { roomId: chatRoomIdList })
    .orderBy("chat.createdAt", "DESC")
    .getMany();

  for (let i = 0; i < chatRoomEntity.length; i++) {
    for (
      let j = chatRoomEntity[i].chat.length;
      chatRoomEntity[i].chat.length - 1 > 0;
      j--
    ) {
      chatRoomEntity[i].chat.pop();
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(chatRoomEntity),
  };
};

/**
 * @api {get}  /chat/getChatMessageList     get chat message list
 * @apiName get chat message list
 * @apiGroup Chat
 *
 * @apiParam (Header)            {string}  Authorization                         Bearer Token
 * @apiParam (QueryStringParam)  {number}  roomId                                room id
 * @apiParam (QueryStringParam)  {number}  offset                                offset
 * @apiParam (QueryStringParam)  {number}  limit                                 limit
 * @apiParamExample Request
[
  {
    "id": "15",
    "message": "test message",
    "createdAt": "2021-03-08T21:35:20.714Z",
    "updatedAt": "2021-03-08T21:35:20.714Z"
  },
  {
    "id": "16",
    "message": "test message",
    "createdAt": "2021-03-08T21:35:27.672Z",
    "updatedAt": "2021-03-08T21:35:27.672Z"
  }
]
 * @apiSuccess  (200 OK) {String} NoContent           Success
 **/
const getChatMessageList = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const { roomId, offset, limit } = event.queryStringParameters;
  const userInfo: UserData = await getUid(event.headers["Authorization"]);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const chatRepository: Repository<Chat> = connection.getRepository(Chat);

  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });
  const chatEntity: Chat[] = await chatRepository.find({
    where: { chatRoom: roomId, user: userEntity },
    order: { createdAt: "ASC" },
    skip: Number(offset),
    take: Number(limit),
  });

  return {
    statusCode: 200,
    body: JSON.stringify(chatEntity),
  };
};

const wrappedCreateRoom = middy(createRoom)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedOnSendMessage = middy(onSendMessage)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetChatRoomList = middy(getChatRoomList)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetChatMessageList = middy(getChatMessageList)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export {
  wrappedCreateRoom as createRoom,
  wrappedOnSendMessage as onSendMessage,
  wrappedGetChatRoomList as getChatRoomList,
  wrappedGetChatMessageList as getChatMessageList,
};
