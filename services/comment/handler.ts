import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Business, Comment } from "../../src/entity/Entity";
import { name } from "../util/util";
// import { CommentBuilder, CommentData } from "../../src/dto/CommentDto";
// import { ReplyBuilder, ReplyData } from "../../src/dto/ReplyDto";
/**
 * @api {put} /comment/:postId/addComment     add comment
 * @apiName Add Comment
 * @apiGroup Comment
 *
 * @apiParam (PathParam) {String}postId                           post id
 * @apiParam (Body) {Number}[commentId]                           reply id
 * @apiParam (Body) {String}message                               message
 *
 * @apiParamExample {json} Request Body(comment)
{
	"message": "테스트 댓글"
}
* @apiParamExample {json} Request Body(reply)
{
	"commentId": 4,
	"message": "테스트 대댓글"
}
 * @apiSuccess (204 No Content) {String}    NoContent  Success
 * @apiSuccessExample {text}    Success
 *      HTTP/1.1    204 No Content
 *
 * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
 * @apiErrorExample {json}  ResourceNotFound
 *      HTTP/1.1    404    Not Found
 **/

export const addComment = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: number = Number(event.pathParameters["postId"]);
  const { commentId = null, message = "" } = JSON.parse(event.body);

  const connection = await getDatabaseConnection();
  const commentRepository: Repository<Comment> = connection.getRepository(
    Comment
  );
  const businessRepository: Repository<Business> = connection.getRepository(
    Business
  );

  const businessEntity: Business = await businessRepository.findOne({
    id: postId,
  });
  const commentEntity: Comment = await commentRepository.findOne({
    id: commentId,
  });

  if (businessEntity == null || commentEntity == null) {
    return {
      statusCode: 500,
      body: JSON.stringify("id(commentId, postId) null"),
    };
  }

  const comment: Comment = new Comment();
  comment.business = businessEntity;
  commentId !== null ? (comment.commentId = commentId) : null;
  comment.message = message;

  commentRepository.save(comment);
  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {put} /comment/:commentId/modifyComment     modify comment
 * @apiName Modify Comment
 * @apiGroup Comment
 *
 * @apiParam (PathParam) {String}commentId                        comment id
 * @apiParam (Body) {String}message                               message
 *
 * @apiSuccess (204 No Content) {String}    NoContent  Success
 * @apiSuccessExample {text}    Success
 *      HTTP/1.1    204 No Content
 *
 * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
 * @apiErrorExample {json}  ResourceNotFound
 *      HTTP/1.1    404    Not Found
 **/

// export const modifyComment = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const commentId: string = event.pathParameters["commentId"];
//   const { message = "" } = JSON.parse(event.body);

//   const connection = await getDatabaseConnection();
//   const commentRepository: Repository<Comment> = connection.getRepository(
//     Comment
//   );
//   // const commentEntity: Comment = await commentRepository.findOne({
//   //   commentId: commentId,
//   // });

//   if (commentEntity == null) {
//     return {
//       statusCode: 404,
//       body: "",
//     };
//   }

//   commentEntity.message = message;
//   commentRepository.save(commentEntity);

//   return {
//     statusCode: 200,
//     body: "",
//   };
// };

/**
 * @api {get} /comment/:postId/getComment     get comment
 * @apiName Get Comment
 * @apiGroup Comment
 *
 * @apiParam (PathParam) {String}postId                           comment id
 * @apiParam (QueryStringParam) {Number}[offset=0]    offset      offset
 * @apiParam (QueryStringParam) {Number}[limit=10]    limit       limit
 * @apiParam (QueryStringParam) {String}[order=desc]  order       order
 *
 * @apiParamExample Response
 [
  {
    "commentId": "29abc2f27c",
    "message": "sadfasdgadhfsfg",
    "createdAt": "2020-11-17T21:03:32.289Z",
    "updatedAt": "2020-11-17T21:03:32.289Z"
  },
  {
    "commentId": "cb931142d5",
    "message": "testtesttest",
    "createdAt": "2020-11-17T20:10:03.335Z",
    "updatedAt": "2020-11-17T21:42:29.000Z"
  }
]
 *
 * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
 * @apiErrorExample {json}  ResourceNotFound
 *      HTTP/1.1    404    Not Found
 **/
// export const getComment = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const postId: string = event.pathParameters["postId"];
//   const {
//     offset = 0,
//     limit = 10,
//     order = "desc",
//   } = event.queryStringParameters;
//   const queryOffset: number = Number(offset);
//   const queryLimit: number = Number(limit);
//   const queryOrder: "ASC" | "DESC" =
//     order.toUpperCase() == "ASC" ? "ASC" : "DESC";

//   const connection = await getDatabaseConnection();
//   const commentRepository: Repository<Comment> = await connection.getRepository(
//     Comment
//   );

//   const commentEntity: Comment[] = await commentRepository
//     .createQueryBuilder("comment")
//     .leftJoin("comment.post", "post")
//     .leftJoin("comment.reply", "reply")
//     .where("post.postId = :postId", {
//       postId: postId,
//     })
//     .andWhere("comment.reply is null")
//     .orderBy("comment.createdAt", queryOrder)
//     .offset(queryOffset)
//     .limit(queryLimit)
//     .getMany();

//   const commentDto: CommentData[] = new CommentBuilder(commentEntity).build();

//   return {
//     statusCode: 200,
//     body: JSON.stringify(commentDto),
//   };
// };

/**
 * @api {get} /comment/:postId/:commentId/getReply     get reply
 * @apiName Get Reply
 * @apiGroup Comment
 *
 * @apiParam (PathParam) {String}postId                           post id
 * @apiParam (PathParam) {String}commentId                        comment id
 * @apiParam (QueryStringParam) {Number}[offset=0]    offset      offset
 * @apiParam (QueryStringParam) {Number}[limit=10]    limit       limit
 * @apiParam (QueryStringParam) {String}[order=asc]  order       order
 *
 * @apiParamExample Response
[
  {
    "commentId": "29abc2f27c",
    "message": "sadfasdgadhfsfg",
    "createdAt": "2020-11-17T21:03:32.289Z",
    "updateAt": "2020-11-17T21:03:32.289Z"
  },
  {
    "commentId": "29abc2f27c",
    "message": "sadfasdgadhfsfg",
    "createdAt": "2020-11-17T21:03:32.289Z",
    "updateAt": "2020-11-17T21:03:32.289Z"
  }
]
 *
 * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
 * @apiErrorExample {json}  ResourceNotFound
 *      HTTP/1.1    404    Not Found
 **/

// export const getReply = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const postId: string = event.pathParameters["postId"];
//   const commentId: string = event.pathParameters["commentId"];

//   const { offset = 0, limit = 10, order = "asc" } = event.queryStringParameters;
//   const queryOffset: number = Number(offset);
//   const queryLimit: number = Number(limit);
//   const queryOrder: "ASC" | "DESC" =
//     order.toUpperCase() == "ASC" ? "ASC" : "DESC";

//   const connection = await getDatabaseConnection();
//   const commentRepository: Repository<Comment> = await connection.getRepository(
//     Comment
//   );

//   const commentEntity: Comment[] = await commentRepository
//     .createQueryBuilder("comment")
//     .leftJoin("comment.post", "post")
//     .leftJoinAndSelect("comment.reply", "reply")
//     .where("post.postId = :postId", {
//       postId: postId,
//     })
//     .andWhere("reply.commentId = :commentId", { commentId: commentId })
//     .andWhere("comment.reply is not null")
//     .orderBy("comment.createdAt", queryOrder)
//     .offset(queryOffset)
//     .limit(queryLimit)
//     .getMany();

//   const replyDto: ReplyData[] = new ReplyBuilder(commentEntity).build();

//   return {
//     statusCode: 200,
//     body: JSON.stringify(replyDto),
//   };
// };

/**
 * @api {get} /comment/:commentId/deleteComment     delete comment
 * @apiName Delete Comment
 * @apiGroup Comment
 *
 * @apiParam (PathParam) {String}commentId                        comment id
 *
 * @apiSuccess (204 No Content) {String}    NoContent  Success
 * @apiSuccessExample {text}    Success
 *      HTTP/1.1    204 No Content
 *
 * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
 * @apiErrorExample {json}  ResourceNotFound
 *      HTTP/1.1    404    Not Found
 **/

// export const deleteComment = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const commentId: string = event.pathParameters["commentId"];

//   const connection = await getDatabaseConnection();
//   const commentRepository: Repository<Comment> = connection.getRepository(
//     Comment
//   );

//   const commentEntity: Comment = await commentRepository.findOne({
//     commentId: commentId,
//   });

//   commentEntity.deleted = true;

//   commentRepository.save(commentEntity);

//   return {
//     statusCode: 200,
//     body: "",
//   };
// };
