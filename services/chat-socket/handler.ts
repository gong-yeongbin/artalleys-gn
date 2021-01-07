// import { APIGatewayEvent, ProxyResult, Context } from "aws-lambda";
// import { ApiGatewayManagementApi } from "aws-sdk";
// import { Repository } from "typeorm";
// import { getDatabaseConnection } from "../../src/connection/Connection";
// import { Chat, User, Post, ChatRoom } from "../../src/entity/Entity";

// export const onConnect = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const connectionId = event.requestContext.connectionId;
//   const uid: string = "testid2";
//   const connection = await getDatabaseConnection();
//   const userRepository = connection.getRepository(User);

//   const userEntity = await userRepository
//     .createQueryBuilder("User")
//     .where("uid = :uid", {
//       uid: uid,
//     })
//     .getOne();

//   if (userEntity == null) {
//     return {
//       statusCode: 404,
//       body: "",
//     };
//   }

//   if (
//     userEntity.connectionId == null ||
//     userEntity.connectionId != connectionId
//   ) {
//     userEntity.connectionId = connectionId;
//     await userRepository.save(userEntity);
//   }

//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       `Entering onConnect on connection id: ${connectionId}`
//     ),
//   };
// };

// export const onDisconnect = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   return {
//     statusCode: 200,
//     body: "",
//   };
// };

// export const onDefault = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   return {
//     statusCode: 200,
//     body: "",
//   };
// };

// // {"action":"connect2","id":"testid"}
// // {"action":"connect2","id":"testid2"}
// export const onConnect2 = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const connectionId = event.requestContext.connectionId;
//   const data = JSON.parse(event.body);
//   const uid: string = data.id;
//   const connection = await getDatabaseConnection();
//   const userRepository = connection.getRepository(User);
//   console.log("@@@ ", data);

//   const userEntity = await userRepository
//     .createQueryBuilder("User")
//     .where("uid = :uid", {
//       uid: uid,
//     })
//     .getOne();
//   if (userEntity == null) {
//     return {
//       statusCode: 404,
//       body: "",
//     };
//   }

//   if (
//     userEntity.connectionId == null ||
//     userEntity.connectionId != connectionId
//   ) {
//     userEntity.connectionId = connectionId;
//     await userRepository.save(userEntity);
//   }

//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       `Entering onConnect on connection id: ${connectionId}`
//     ),
//   };
// };

// // {"action":"onSendMessage", "uid":"testid","message":"test msg","postId":"aa74538fddecbafb3674","receiveId":"testid2"}
// // {"action":"onSendMessage", "uid":"testid2","message":"test msg","postId":"aa74538fddecbafb3674","receiveId":"testid"}
// export const onSendMessage = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const data = JSON.parse(event.body);
//   const uid: string = data.uid;
//   const message: string = data.message;
//   const postId: string = data.postId;
//   const receiveId: string = data.receiveId;

//   const connection = await getDatabaseConnection();
//   const userRepository = connection.getRepository(User);
//   const postRepository = connection.getRepository(Post);
//   const chatRepository = connection.getRepository(Chat);
//   const chatRoomRepository = connection.getRepository(ChatRoom);

//   const chatRoomEntity: ChatRoom = await chatRoomRepository.findOne({
//     seller_id: uid,
//   });
//   const postEntity: Post = await postRepository.findOne({ postId: postId });
//   const userEntity = await userRepository.findOne({
//     uid: receiveId,
//   });

//   if (chatRoomEntity == null) {
//     let room = new ChatRoom();
//     room.buyer_id = uid;
//     room.seller_id = receiveId;
//     room.post = postEntity;
//   }

//   if (userEntity == null || postEntity == null) {
//     return {
//       statusCode: 404,
//       body: "",
//     };
//   }

//   let chat: Chat = new Chat();
//   chat.sendId = uid;
//   chat.receiveId = receiveId;
//   chat.message = message;
//   await chatRepository.save(chat);

//   const api: ApiGatewayManagementApi = new ApiGatewayManagementApi({
//     apiVersion: "2018-11-29",
//     endpoint:
//       event.requestContext.domainName + "/" + event.requestContext.stage,
//   });

//   await api
//     .postToConnection({
//       ConnectionId: userEntity.connectionId,
//       Data: message,
//     })
//     .promise();

//   return {
//     statusCode: 200,
//     body: "",
//   };
// };

// /**
//  * @api {get} /chat/getCHatRoomList     get chat room list
//  * @apiName Get Chat Room List
//  * @apiGroup Chat
//  *
//  *
//  * @apiParamExample Response
//  [
//   {
//     "id": "31",
//     "sendId": "testid2",
//     "receiveId": "testid",
//     "message": "you too",
//     "createdAt": "2020-12-02T03:46:12.263Z",
//     "updatedAt": "2020-12-02T03:46:12.263Z"
//   }
// ]
//  *
//  * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
//  * @apiErrorExample {json}  ResourceNotFound
//  *      HTTP/1.1    404    Not Found
//  **/

// export const getChatRoomList = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const uid: string = "testid";
//   const connection = await getDatabaseConnection();
//   const chatRepository: Repository<Chat> = connection.getRepository(Chat);
//   const chatEntity: Chat[] = await chatRepository
//     .createQueryBuilder("chat")
//     .where("chat.sendId = :id || chat.receiveId = :id", { id: uid })
//     .orderBy("chat.createdAt", "DESC")
//     .limit(1)
//     .getMany();

//   if (chatEntity == null) {
//     return {
//       statusCode: 404,
//       body: "",
//     };
//   }

//   return {
//     statusCode: 200,
//     body: JSON.stringify(chatEntity),
//   };
// };

// /**
//  * @api {get} /chat/:receiveId/getChatContentList     get chat content list
//  * @apiName Get Chat Content List
//  * @apiGroup Chat
//  *
//  * @apiParam (PathParam) {String}receiveId                           receive Id
//  * @apiParam (QueryStringParam) {Number}[offset=0]    offset      offset
//  * @apiParam (QueryStringParam) {Number}[limit=10]    limit       limit
//  *
//  * @apiParamExample Response
//  [
//   {
//     "id": "31",
//     "sendId": "testid2",
//     "receiveId": "testid",
//     "message": "you too",
//     "createdAt": "2020-12-02T03:46:12.263Z",
//     "updatedAt": "2020-12-02T03:46:12.263Z"
//   },
//   {
//     "id": "30",
//     "sendId": "testid",
//     "receiveId": "testid2",
//     "message": "omg",
//     "createdAt": "2020-12-02T03:46:01.336Z",
//     "updatedAt": "2020-12-02T03:46:01.336Z"
//   },
//   {
//     "id": "29",
//     "sendId": "testid2",
//     "receiveId": "testid",
//     "message": "wow good",
//     "createdAt": "2020-12-02T03:45:51.943Z",
//     "updatedAt": "2020-12-02T03:45:51.943Z"
//   },
// ]
//  *
//  * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
//  * @apiErrorExample {json}  ResourceNotFound
//  *      HTTP/1.1    404    Not Found
//  **/

// export const getChatContentList = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const uid: string = "testid";
//   const receiveId: string = event.pathParameters["receiveId"];
//   const { offset = 0, limit = 10 } = event.queryStringParameters;
//   const queryOffset: number = Number(offset);
//   const queryLimit: number = Number(limit);
//   const connection = await getDatabaseConnection();
//   const chatRepository: Repository<Chat> = connection.getRepository(Chat);

//   const chatEntity: Chat[] = await chatRepository
//     .createQueryBuilder("chat")
//     .where("chat.sendId = :id || chat.receiveId = :receiveId", {
//       id: uid,
//       receiveId: receiveId,
//     })
//     .orderBy("chat.createdAt", "ASC")
//     .offset(queryOffset)
//     .limit(queryLimit)
//     .getMany();

//   if (chatEntity == null) {
//     return {
//       statusCode: 404,
//       body: "",
//     };
//   }

//   return {
//     statusCode: 200,
//     body: JSON.stringify(chatEntity),
//   };
// };
