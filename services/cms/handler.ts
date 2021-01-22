import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "../../services/util/authorizer";
import { Connection, Repository, SelectQueryBuilder } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { Notice } from "../../src/entity/Entity";
import { NoticeBuilder } from "../../src/dto/NoticeDto";

/**
 * @api {put}  /cms/notice/createNotice     create notice
 * @apiName Create Notice
 * @apiGroup CMS
 *
 * @apiParam (Header)   {string} AuthArization                                        Bearer Token
 * @apiParam (Body)     {string} title                                                notice title
 * @apiParam (Body)     {string} category                                             notice category
 * @apiParam (Body)     {string} content                                              notice content
 * @apiParam (Body)     {boolean} publish=false                                       notice publish
 * @apiParam (Body)     {boolean} pushNotification=false                              notice push notification
 * @apiParamExample Request
 {
	"title": "notice test",
	"category": "new",                  
  "content": "notice test content",
  "publish": true,
  "pushNotification": true                                              
}
 **/
const createNotice = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection: Connection = await getDatabaseConnection();
  const noticeRepository: Repository<Notice> = connection.getRepository(Notice);
  const {
    title,
    category,
    pushNotification = false,
    publish = false,
    content,
  } = JSON.parse(event.body);

  if (title == null || content == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  let notice: Notice = new Notice();
  notice.title = title;
  notice.category = category;
  notice.pushNotification = pushNotification;
  notice.publish = publish;
  notice.content = content;

  await noticeRepository.save(notice);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {put}  /cms/notice/modifyNotice     modify notice
 * @apiName Modify Notice
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (PathParam)            {number} id                                 notice id
 * @apiParamExample Request
 {
	"title": "notice test",
	"category": "new",                  
  "content": "notice test content",
  "publish": true,
  "pushNotification": true                                              
}
 **/
const modifyNotice = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const noticeId: number = Number(event.pathParameters["id"]);
  const {
    title,
    category,
    pushNotification = false,
    publish = false,
    content,
  } = JSON.parse(event.body);
  const connection: Connection = await getDatabaseConnection();
  const noticeRepository: Repository<Notice> = connection.getRepository(Notice);
  const noticeEntity: Notice = await noticeRepository.findOne({ id: noticeId });
  if (noticeEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  noticeEntity.title = title;
  noticeEntity.category = category;
  noticeEntity.pushNotification = pushNotification;
  noticeEntity.publish = publish;
  noticeEntity.content = content;
  noticeRepository.save(noticeEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /cms/notice/deleteNotice     delete notice
 * @apiName Delete Notice
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (PathParam)            {number} id                                 notice id
 **/
const deleteNotice = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const noticeId: number = Number(event.pathParameters["id"]);
  const connection: Connection = await getDatabaseConnection();
  const noticeRepository: Repository<Notice> = connection.getRepository(Notice);
  const noticeEntity: Notice = await noticeRepository.findOne({ id: noticeId });
  if (noticeEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  await noticeRepository.delete({ id: noticeId });
  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /cms/notice/getNoticeList     get notice list
 * @apiName Get Notice List
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                                                  Bearer Token
 * @apiParam (QueryStringParam)     {number} offset=0                                                         list offset
 * @apiParam (QueryStringParam)     {number} limit=10                                                          list limit
 * @apiParam (QueryStringParam)     {string=desc,asc} order=desc                                                 list order
 * @apiParam (QueryStringParam)     {string=all,notice,event,new,on,off} filter=all                             list filter
 *
 * @apiParamExample response
 {
  "data": [
    {
      "id": "3",
      "title": "notice test",
      "category": "New",
      "pushNotification": false,
      "publish": false,
      "content": "notice modify test content",
      "createdAt": "2021-01-20T21:56:48.920Z",
      "updatedAt": "2021-01-20T21:57:24.000Z"
    },
    {
      "id": "5",
      "title": "notice test",
      "category": "Event",
      "pushNotification": false,
      "publish": true,
      "content": "notice test content",
      "createdAt": "2021-01-20T22:27:03.523Z",
      "updatedAt": "2021-01-20T22:27:03.523Z"
    },
    {
      "id": "6",
      "title": "notice test",
      "category": "new",
      "pushNotification": false,
      "publish": false,
      "content": "notice test content",
      "createdAt": "2021-01-20T22:27:07.465Z",
      "updatedAt": "2021-01-20T22:27:07.465Z"
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 10,
    "order": "ASC",
    "filter": "Off",
    "length": 3,
    "totalCount": 4
  }
}
 **/
const getNoticeList = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const {
    offset = 0,
    limit = 10,
    order = "desc",
    filter = "all", // All, Notice, Event, New, On, Off
  } = event.queryStringParameters;
  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryOrder: "ASC" | "DESC" = order.toUpperCase() as "ASC" | "DESC";
  const queryFilter: string =
    filter.charAt(0).toUpperCase() + filter.slice(1) == "All"
      ? ""
      : filter.charAt(0).toUpperCase() + filter.slice(1);

  const connection: Connection = await getDatabaseConnection();
  const noticeRepository: Repository<Notice> = connection.getRepository(Notice);

  let query: SelectQueryBuilder<Notice> = noticeRepository
    .createQueryBuilder("notice")
    .orderBy("notice.createdAt", queryOrder)
    .offset(queryOffset)
    .limit(queryLimit);

  if (queryFilter == "On" || queryFilter == "Off") {
    let pushNotification = queryFilter == "On" ? true : false;

    query.where("notice.pushNotification =:pushNotification", {
      pushNotification: pushNotification,
    });
  } else {
    query.where("notice.category =:category", { category: filter });
  }

  const noticeEntityTotalCount: number = await noticeRepository
    .createQueryBuilder("notice")
    .getCount();

  const noticeEntity: Notice[] = await query.getMany();
  const noticeDto: any = new NoticeBuilder(
    noticeEntity,
    queryOffset,
    queryLimit,
    queryOrder,
    queryFilter,
    noticeEntityTotalCount
  ).build();

  return {
    statusCode: 200,
    body: JSON.stringify(noticeDto),
  };
};

const wrappedCreateNotice = middy(createNotice)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedModifyNotice = middy(modifyNotice)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedDeleteNotice = middy(deleteNotice)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetNoticeList = middy(getNoticeList)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
export {
  wrappedCreateNotice as createNotice,
  wrappedModifyNotice as modifyNotice,
  wrappedDeleteNotice as deleteNotice,
  wrappedGetNoticeList as getNoticeList,
};
