import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { User, Business, Comment, BusinessPost } from "../../src/entity/Entity";
import { CommentBuilder } from "../../src/dto/CommentDto";
import { UserData } from "../../src/types/dataType";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "../util/authorizer";
import { getUid } from "../util/util";
const { CLOUDFRONT_IMAGE } = process.env;
/**
 * @api {put} /comment/:postId/addComment     add comment
 * @apiName Add Comment
 * @apiGroup Comment
 *
 * @apiParam (PathParam) {String}postId                           post id
 * @apiParam (QueryStringParam) {String=Business,BusinessPost} type   post type
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

const addComment = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const postId: number = Number(event.pathParameters["postId"]);
  const type: string = event.queryStringParameters["type"];

  const { commentId = null, message = "" } = JSON.parse(event.body);

  const connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const commentRepository: Repository<Comment> = connection.getRepository(
    Comment
  );
  const genericRepository: Repository<
    Business | BusinessPost
  > = connection.getRepository(type);

  const userEntity: User = await userRepository.findOne({
    uid: userInfo.uid,
  });
  const genericEntity:
    | Business
    | BusinessPost = await genericRepository.findOne({ id: postId });

  if (genericEntity == null) {
    return {
      statusCode: 500,
      body: JSON.stringify("id(commentId, postId) null"),
    };
  }

  const comment: Comment = new Comment();
  type == "Business"
    ? (comment.business = genericEntity as Business)
    : (comment.businessPost = genericEntity as BusinessPost);
  commentId !== null ? (comment.commentId = commentId) : null;
  comment.message = message;
  comment.user = userEntity;
  await commentRepository.save(comment);

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
const modifyComment = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const commentId: number = Number(event.pathParameters["commentId"]);
  const { message = "" } = JSON.parse(event.body);

  const connection = await getDatabaseConnection();
  const commentRepository: Repository<Comment> = connection.getRepository(
    Comment
  );
  const commentEntity: Comment = await commentRepository.findOne({
    id: commentId,
  });

  if (commentEntity == null) {
    return {
      statusCode: 500,
      body: JSON.stringify("comment id null"),
    };
  }

  commentEntity.message = message;
  commentRepository.save(commentEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get} /comment/:postId/getComment     get comment
 * @apiName Get Comment
 * @apiGroup Comment
 *
 * @apiParam (PathParam) {String}postId                                         post id
 * @apiParam (QueryStringParam) {Number}[offset=0]    offset                    offset
 * @apiParam (QueryStringParam) {Number}[limit=10]    limit                     limit
 * @apiParam (QueryStringParam) {String}[order=desc]  order                     order
 * @apiParam (QueryStringParam) {String=busienss,businessPost}   type      comment type
 *
 * @apiParamExample Response
{
  "data": [
    {
      "id": "13",
      "message": "test reply message",
      "createdAt": "2021-01-15T01:40:43.296Z",
      "updatedAt": "2021-01-15T01:40:43.296Z",
      "user": {
        "userId": "12",
        "nickName": null,
        "url": "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/image/1f4f9f09-df24-4be5-a8eb-883b5a58ba04.png"
      }
    },
    {
      "id": "12",
      "message": "test reply message",
      "createdAt": "2021-01-15T01:40:29.495Z",
      "updatedAt": "2021-01-15T01:40:29.495Z",
      "user": {
        "userId": "12",
        "nickName": null,
        "url": "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/image/1f4f9f09-df24-4be5-a8eb-883b5a58ba04.png"
      }
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 3,
    "order": "DESC",
    "totalCount": 2
  }
}
 *
 * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
 * @apiErrorExample {json}  ResourceNotFound
 *      HTTP/1.1    404    Not Found
 **/
const getComment = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: number = Number(event.pathParameters["postId"]);
  const {
    offset = 0,
    limit = 10,
    order = "desc",
    type,
  } = event.queryStringParameters;
  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryOrder: "ASC" | "DESC" =
    order.toUpperCase() == "ASC" ? "ASC" : "DESC";

  const connection = await getDatabaseConnection();

  const genericRepository: Repository<
    Business | BusinessPost
  > = connection.getRepository(type);

  const genericEntity:
    | Business
    | BusinessPost = await genericRepository.findOne({ id: postId });

  if (genericEntity == null) {
    return {
      statusCode: 500,
      body: JSON.stringify("post Id null"),
    };
  }
  const commentRepository: Repository<Comment> = await connection.getRepository(
    Comment
  );

  let query = commentRepository
    .createQueryBuilder("comment")
    .leftJoinAndSelect("comment.commentId", "commentId")
    .leftJoinAndSelect("comment.user", "user")
    .leftJoinAndSelect("user.image", "image")
    .orderBy("comment.createdAt", queryOrder)
    .offset(queryOffset)
    .limit(queryLimit);

  if (type == "Business") {
    query = query
      .leftJoinAndSelect("comment.business", "business")
      .where("business.id = :id and comment.commentId is null", {
        id: postId,
      });
  } else if (type == "BusienssPost") {
    query = query
      .leftJoinAndSelect(
        "comment.businessPost and comment.commentId is null",
        "businessPost"
      )
      .where("businessPost.id = :id", {
        id: postId,
      });
  }

  const commentEntity: [Comment[], number] = await query.getManyAndCount();

  const commentDto: any = new CommentBuilder(
    commentEntity[0],
    queryOffset,
    queryLimit,
    queryOrder,
    commentEntity[1]
  )
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(commentDto),
  };
};

/**
 * @api {get} /comment/:postId/getReply     get reply
 * @apiName Get reply
 * @apiGroup Comment
 *
 * @apiParam (PathParam) {String}postId                                         post id
 * @apiParam (QueryStringParam) {Number}[offset=0]    offset                    offset
 * @apiParam (QueryStringParam) {Number}[limit=10]    limit                     limit
 * @apiParam (QueryStringParam) {String}[order=desc]  order                     order
 * @apiParam (QueryStringParam) {String=busienss,businessPost}   type      comment type
 *
 * @apiParamExample Response
{
  "data": [
    {
      "id": "13",
      "message": "test reply message",
      "createdAt": "2021-01-15T01:40:43.296Z",
      "updatedAt": "2021-01-15T01:40:43.296Z",
      "user": {
        "userId": "12",
        "nickName": null,
        "url": "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/image/1f4f9f09-df24-4be5-a8eb-883b5a58ba04.png"
      }
    },
    {
      "id": "12",
      "message": "test reply message",
      "createdAt": "2021-01-15T01:40:29.495Z",
      "updatedAt": "2021-01-15T01:40:29.495Z",
      "user": {
        "userId": "12",
        "nickName": null,
        "url": "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/image/1f4f9f09-df24-4be5-a8eb-883b5a58ba04.png"
      }
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 3,
    "order": "DESC",
    "totalCount": 2
  }
}
 *
 * @apiError (404 Not Found)    ResourceNotFound    This resource cannot be found
 * @apiErrorExample {json}  ResourceNotFound
 *      HTTP/1.1    404    Not Found
 **/
const getReply = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const postId: number = Number(event.pathParameters["postId"]);
  const {
    offset = 0,
    limit = 10,
    order = "desc",
    type,
  } = event.queryStringParameters;
  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryOrder: "ASC" | "DESC" =
    order.toUpperCase() == "ASC" ? "ASC" : "DESC";

  const connection = await getDatabaseConnection();

  const genericRepository: Repository<
    Business | BusinessPost
  > = connection.getRepository(type);

  const genericEntity:
    | Business
    | BusinessPost = await genericRepository.findOne({ id: postId });

  if (genericEntity == null) {
    return {
      statusCode: 500,
      body: JSON.stringify("post Id null"),
    };
  }
  const commentRepository: Repository<Comment> = await connection.getRepository(
    Comment
  );

  let query = commentRepository
    .createQueryBuilder("comment")
    .leftJoinAndSelect("comment.commentId", "commentId")
    .leftJoinAndSelect("comment.user", "user")
    .leftJoinAndSelect("user.image", "image")
    .orderBy("comment.createdAt", queryOrder)
    .offset(queryOffset)
    .limit(queryLimit);

  if (type == "Business") {
    query = query
      .leftJoinAndSelect("comment.business", "business")
      .where("business.id = :id and comment.commentId is not null", {
        id: postId,
      });
  } else if (type == "BusienssPost") {
    query = query
      .leftJoinAndSelect(
        "comment.businessPost and comment.commentId is not null",
        "businessPost"
      )
      .where("businessPost.id = :id", {
        id: postId,
      });
  }

  const commentEntity: Comment[] = await query.getMany();
  const totalCount: number = await query.getCount();

  const commentDto: any = new CommentBuilder(
    commentEntity,
    queryOffset,
    queryLimit,
    queryOrder,
    totalCount
  )
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(commentDto),
  };
};

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
const deleteComment = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const commentId: number = Number(event.pathParameters["commentId"]);

  const connection = await getDatabaseConnection();
  const commentRepository: Repository<Comment> = connection.getRepository(
    Comment
  );

  const commentEntity: Comment = await commentRepository.findOne({
    id: commentId,
  });

  if (commentEntity == null) {
    return {
      statusCode: 500,
      body: JSON.stringify("comment id null"),
    };
  }

  commentEntity.deleted = true;
  commentRepository.save(commentEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

const wrappedAddComment = middy(addComment)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetComment = middy(getComment)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetReply = middy(getReply)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedModifyComment = middy(modifyComment)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedDeleteComment = middy(deleteComment)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export {
  wrappedAddComment as addComment,
  wrappedGetComment as getComment,
  wrappedGetReply as getReply,
  wrappedModifyComment as modifyComment,
  wrappedDeleteComment as deleteComment,
};
