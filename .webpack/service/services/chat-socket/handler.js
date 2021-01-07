(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./services/chat-socket/handler.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./services/chat-socket/handler.ts":
/*!*****************************************!*\
  !*** ./services/chat-socket/handler.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// import { APIGatewayEvent, ProxyResult, Context } from \"aws-lambda\";\n// import { ApiGatewayManagementApi } from \"aws-sdk\";\n// import { Repository } from \"typeorm\";\n// import { getDatabaseConnection } from \"../../src/connection/Connection\";\n// import { Chat, User, Post, ChatRoom } from \"../../src/entity/Entity\";\n// export const onConnect = async (\n//   event: APIGatewayEvent,\n//   context: Context\n// ): Promise<ProxyResult> => {\n//   const connectionId = event.requestContext.connectionId;\n//   const uid: string = \"testid2\";\n//   const connection = await getDatabaseConnection();\n//   const userRepository = connection.getRepository(User);\n//   const userEntity = await userRepository\n//     .createQueryBuilder(\"User\")\n//     .where(\"uid = :uid\", {\n//       uid: uid,\n//     })\n//     .getOne();\n//   if (userEntity == null) {\n//     return {\n//       statusCode: 404,\n//       body: \"\",\n//     };\n//   }\n//   if (\n//     userEntity.connectionId == null ||\n//     userEntity.connectionId != connectionId\n//   ) {\n//     userEntity.connectionId = connectionId;\n//     await userRepository.save(userEntity);\n//   }\n//   return {\n//     statusCode: 200,\n//     body: JSON.stringify(\n//       `Entering onConnect on connection id: ${connectionId}`\n//     ),\n//   };\n// };\n// export const onDisconnect = async (\n//   event: APIGatewayEvent,\n//   context: Context\n// ): Promise<ProxyResult> => {\n//   return {\n//     statusCode: 200,\n//     body: \"\",\n//   };\n// };\n// export const onDefault = async (\n//   event: APIGatewayEvent,\n//   context: Context\n// ): Promise<ProxyResult> => {\n//   return {\n//     statusCode: 200,\n//     body: \"\",\n//   };\n// };\n// // {\"action\":\"connect2\",\"id\":\"testid\"}\n// // {\"action\":\"connect2\",\"id\":\"testid2\"}\n// export const onConnect2 = async (\n//   event: APIGatewayEvent,\n//   context: Context\n// ): Promise<ProxyResult> => {\n//   const connectionId = event.requestContext.connectionId;\n//   const data = JSON.parse(event.body);\n//   const uid: string = data.id;\n//   const connection = await getDatabaseConnection();\n//   const userRepository = connection.getRepository(User);\n//   console.log(\"@@@ \", data);\n//   const userEntity = await userRepository\n//     .createQueryBuilder(\"User\")\n//     .where(\"uid = :uid\", {\n//       uid: uid,\n//     })\n//     .getOne();\n//   if (userEntity == null) {\n//     return {\n//       statusCode: 404,\n//       body: \"\",\n//     };\n//   }\n//   if (\n//     userEntity.connectionId == null ||\n//     userEntity.connectionId != connectionId\n//   ) {\n//     userEntity.connectionId = connectionId;\n//     await userRepository.save(userEntity);\n//   }\n//   return {\n//     statusCode: 200,\n//     body: JSON.stringify(\n//       `Entering onConnect on connection id: ${connectionId}`\n//     ),\n//   };\n// };\n// // {\"action\":\"onSendMessage\", \"uid\":\"testid\",\"message\":\"test msg\",\"postId\":\"aa74538fddecbafb3674\",\"receiveId\":\"testid2\"}\n// // {\"action\":\"onSendMessage\", \"uid\":\"testid2\",\"message\":\"test msg\",\"postId\":\"aa74538fddecbafb3674\",\"receiveId\":\"testid\"}\n// export const onSendMessage = async (\n//   event: APIGatewayEvent,\n//   context: Context\n// ): Promise<ProxyResult> => {\n//   const data = JSON.parse(event.body);\n//   const uid: string = data.uid;\n//   const message: string = data.message;\n//   const postId: string = data.postId;\n//   const receiveId: string = data.receiveId;\n//   const connection = await getDatabaseConnection();\n//   const userRepository = connection.getRepository(User);\n//   const postRepository = connection.getRepository(Post);\n//   const chatRepository = connection.getRepository(Chat);\n//   const chatRoomRepository = connection.getRepository(ChatRoom);\n//   const chatRoomEntity: ChatRoom = await chatRoomRepository.findOne({\n//     seller_id: uid,\n//   });\n//   const postEntity: Post = await postRepository.findOne({ postId: postId });\n//   const userEntity = await userRepository.findOne({\n//     uid: receiveId,\n//   });\n//   if (chatRoomEntity == null) {\n//     let room = new ChatRoom();\n//     room.buyer_id = uid;\n//     room.seller_id = receiveId;\n//     room.post = postEntity;\n//   }\n//   if (userEntity == null || postEntity == null) {\n//     return {\n//       statusCode: 404,\n//       body: \"\",\n//     };\n//   }\n//   let chat: Chat = new Chat();\n//   chat.sendId = uid;\n//   chat.receiveId = receiveId;\n//   chat.message = message;\n//   await chatRepository.save(chat);\n//   const api: ApiGatewayManagementApi = new ApiGatewayManagementApi({\n//     apiVersion: \"2018-11-29\",\n//     endpoint:\n//       event.requestContext.domainName + \"/\" + event.requestContext.stage,\n//   });\n//   await api\n//     .postToConnection({\n//       ConnectionId: userEntity.connectionId,\n//       Data: message,\n//     })\n//     .promise();\n//   return {\n//     statusCode: 200,\n//     body: \"\",\n//   };\n// };\n// /**\n//  * @api {get} /chat/getCHatRoomList     get chat room list\n//  * @apiName Get Chat Room List\n//  * @apiGroup Chat\n//  *\n//  *\n//  * @apiParamExample Response\n//  [\n//   {\n//     \"id\": \"31\",\n//     \"sendId\": \"testid2\",\n//     \"receiveId\": \"testid\",\n//     \"message\": \"you too\",\n//     \"createdAt\": \"2020-12-02T03:46:12.263Z\",\n//     \"updatedAt\": \"2020-12-02T03:46:12.263Z\"\n//   }\n// ]\n//  *\n//  * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found\n//  * @apiErrorExample {json}  ResourceNotFound\n//  *      HTTP/1.1    404    Not Found\n//  **/\n// export const getChatRoomList = async (\n//   event: APIGatewayEvent,\n//   context: Context\n// ): Promise<ProxyResult> => {\n//   const uid: string = \"testid\";\n//   const connection = await getDatabaseConnection();\n//   const chatRepository: Repository<Chat> = connection.getRepository(Chat);\n//   const chatEntity: Chat[] = await chatRepository\n//     .createQueryBuilder(\"chat\")\n//     .where(\"chat.sendId = :id || chat.receiveId = :id\", { id: uid })\n//     .orderBy(\"chat.createdAt\", \"DESC\")\n//     .limit(1)\n//     .getMany();\n//   if (chatEntity == null) {\n//     return {\n//       statusCode: 404,\n//       body: \"\",\n//     };\n//   }\n//   return {\n//     statusCode: 200,\n//     body: JSON.stringify(chatEntity),\n//   };\n// };\n// /**\n//  * @api {get} /chat/:receiveId/getChatContentList     get chat content list\n//  * @apiName Get Chat Content List\n//  * @apiGroup Chat\n//  *\n//  * @apiParam (PathParam) {String}receiveId                           receive Id\n//  * @apiParam (QueryStringParam) {Number}[offset=0]    offset      offset\n//  * @apiParam (QueryStringParam) {Number}[limit=10]    limit       limit\n//  *\n//  * @apiParamExample Response\n//  [\n//   {\n//     \"id\": \"31\",\n//     \"sendId\": \"testid2\",\n//     \"receiveId\": \"testid\",\n//     \"message\": \"you too\",\n//     \"createdAt\": \"2020-12-02T03:46:12.263Z\",\n//     \"updatedAt\": \"2020-12-02T03:46:12.263Z\"\n//   },\n//   {\n//     \"id\": \"30\",\n//     \"sendId\": \"testid\",\n//     \"receiveId\": \"testid2\",\n//     \"message\": \"omg\",\n//     \"createdAt\": \"2020-12-02T03:46:01.336Z\",\n//     \"updatedAt\": \"2020-12-02T03:46:01.336Z\"\n//   },\n//   {\n//     \"id\": \"29\",\n//     \"sendId\": \"testid2\",\n//     \"receiveId\": \"testid\",\n//     \"message\": \"wow good\",\n//     \"createdAt\": \"2020-12-02T03:45:51.943Z\",\n//     \"updatedAt\": \"2020-12-02T03:45:51.943Z\"\n//   },\n// ]\n//  *\n//  * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found\n//  * @apiErrorExample {json}  ResourceNotFound\n//  *      HTTP/1.1    404    Not Found\n//  **/\n// export const getChatContentList = async (\n//   event: APIGatewayEvent,\n//   context: Context\n// ): Promise<ProxyResult> => {\n//   const uid: string = \"testid\";\n//   const receiveId: string = event.pathParameters[\"receiveId\"];\n//   const { offset = 0, limit = 10 } = event.queryStringParameters;\n//   const queryOffset: number = Number(offset);\n//   const queryLimit: number = Number(limit);\n//   const connection = await getDatabaseConnection();\n//   const chatRepository: Repository<Chat> = connection.getRepository(Chat);\n//   const chatEntity: Chat[] = await chatRepository\n//     .createQueryBuilder(\"chat\")\n//     .where(\"chat.sendId = :id || chat.receiveId = :receiveId\", {\n//       id: uid,\n//       receiveId: receiveId,\n//     })\n//     .orderBy(\"chat.createdAt\", \"ASC\")\n//     .offset(queryOffset)\n//     .limit(queryLimit)\n//     .getMany();\n//   if (chatEntity == null) {\n//     return {\n//       statusCode: 404,\n//       body: \"\",\n//     };\n//   }\n//   return {\n//     statusCode: 200,\n//     body: JSON.stringify(chatEntity),\n//   };\n// };\n\n\n//# sourceURL=webpack:///./services/chat-socket/handler.ts?");

/***/ })

/******/ })));