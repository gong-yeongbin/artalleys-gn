import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "../../services/util/authorizer";
import { Connection, Repository, SelectQueryBuilder } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { User, Notice, Cs, ContactCs } from "../../src/entity/Entity";
import { UserData } from "../../src/types/dataType";
import { NoticeBuilder } from "../../src/dto/NoticeDto";
import { CsBuilder } from "../../src/dto/CsDto";
import { getUid } from "../util/util";
import { ContactCsBuilder } from "../../src/dto/ContactCsDto";
import { ContactCsListBuilder } from "../../src/dto/ContactCsListDto";

/**
 * @api {put}  /cms/notice/createNotice     create notice
 * @apiName Create Notice
 * @apiGroup CMS
 *
 * @apiParam (Header)   {string} AuthArization                                        Bearer Token
 * @apiParam (Body)     {string} title                                                notice title
 * @apiParam (Body)     {string=Notice, Event, New} category                          notice category
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
    category = "New",
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
  notice.category = category.charAt(0).toUpperCase() + category.slice(1);
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
 * @apiParam (Body)     {string} title                                                notice title
 * @apiParam (Body)     {string=Notice, Event, New} category                                             notice category
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
const modifyNotice = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const noticeId: number = Number(event.pathParameters["id"]);
  const {
    title,
    category = "New",
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
  noticeEntity.category = category.charAt(0).toUpperCase() + category.slice(1);
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
    filter = "all",
  } = event.queryStringParameters;
  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryOrder: "ASC" | "DESC" = order.toUpperCase() as "ASC" | "DESC";
  const queryFilter: string = filter.charAt(0).toUpperCase() + filter.slice(1);

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
  } else if (queryFilter != "All") {
    query.where("notice.category =:category", { category: filter });
  }

  const noticeEntity: [Notice[], number] = await query.getManyAndCount();
  const noticeDto: any = new NoticeBuilder(
    noticeEntity[0],
    queryOffset,
    queryLimit,
    queryOrder,
    queryFilter,
    noticeEntity[1]
  ).build();

  return {
    statusCode: 200,
    body: JSON.stringify(noticeDto),
  };
};

/**
 * @api {put}  /cms/cs/createCs     create cs
 * @apiName Create Cs
 * @apiGroup CMS
 *
 * @apiParam (Header)   {string} AuthArization                                        Bearer Token
 * @apiParam (Body)     {string} title                                                cs title
 * @apiParam (Body)     {string=OperationalPolicy,AccountCertified,PurchaseSale,TransactionItem,TransactionManners,EventInvitation,RestrictionsOnUse,NeighborhoodBusiness,LocalAdvertising,other} category                                             cs category
 * @apiParam (Body)     {string} content                                              cs content
 * @apiParam (Body)     {boolean} publish=false                                       cs publish
 * @apiParam (Body)     {boolean} pushNotification=false                              cs push notification
 * @apiParamExample Request
 {
	"title": "notice test",
	"category": "OperationalPolicy",                  
  "content": "notice test content",
  "publish": true,                                           
}
 **/
const createCs = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection: Connection = await getDatabaseConnection();
  const csRepository: Repository<Cs> = connection.getRepository(Cs);
  const { title, category, publish = false, content } = JSON.parse(event.body);

  if (title == null || content == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  let cs: Cs = new Cs();
  cs.title = title;
  cs.category = category;
  cs.publish = publish;
  cs.content = content;

  await csRepository.save(cs);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {put}  /cms/cs/modifyCs     modify cs
 * @apiName Modify Cs
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (PathParam)            {number} id                                 cs id
 * @apiParam (Body)                 {string} title                              title
 * @apiParam (Body)                 {string=OperationalPolicy,AccountCertified,PurchaseSale,TransactionItem,TransactionManners,EventInvitation,RestrictionsOnUse,NeighborhoodBusiness,LocalAdvertising,other} category                           category
 * @apiParam (Body)                 {string} content                            content
 * @apiParam (Body)                 {boolean} publish                           publish
 * @apiParamExample Request
 {
	"title": "notice test",
	"category": "new",                  
  "content": "notice test content",
  "publish": true,
}
 **/
const modifyCs = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const csId: number = Number(event.pathParameters["id"]);
  const { title, category, publish = false, content } = JSON.parse(event.body);
  const connection: Connection = await getDatabaseConnection();
  const csRepository: Repository<Cs> = connection.getRepository(Cs);
  const csEntity: Cs = await csRepository.findOne({ id: csId });
  if (csEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  csEntity.title = title;
  csEntity.category = category;
  csEntity.publish = publish;
  csEntity.content = content;
  csRepository.save(csEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /cms/cs/deleteNotice     delete cs
 * @apiName Delete Cs
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (PathParam)            {number} id                                 notice id
 **/
const deleteCs = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const csId: number = Number(event.pathParameters["id"]);
  const connection: Connection = await getDatabaseConnection();
  const csRepository: Repository<Cs> = connection.getRepository(Cs);
  const csEntity: Cs = await csRepository.findOne({ id: csId });
  if (csEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  await csRepository.delete({ id: csId });

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /cms/cs/getCsList     get cs list
 * @apiName Get Cs List
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (QueryStringParam)     {number} offset=0                           list offset
 * @apiParam (QueryStringParam)     {number} limit=10                           list limit
 * @apiParam (QueryStringParam)     {string=desc,asc} order=desc                list order
 * @apiParamExample response
 {
  "data": [
    {
      "id": "8",
      "title": "cs test",
      "category": "NeighborhoodBusiness",
      "content": "cs test content",
      "createdAt": "2021-01-21T17:26:40.290Z",
      "updatedAt": "2021-01-21T17:26:40.290Z"
    },
    {
      "id": "7",
      "title": "cs test",
      "category": "NeighborhoodBusiness",
      "content": "cs test content",
      "createdAt": "2021-01-21T17:26:39.513Z",
      "updatedAt": "2021-01-21T17:26:39.513Z"
    },
    {
      "id": "6",
      "title": "cs test",
      "category": "NeighborhoodBusiness",
      "content": "cs test content",
      "createdAt": "2021-01-21T17:26:38.716Z",
      "updatedAt": "2021-01-21T17:26:38.716Z"
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 3,
    "order": "DESC",
    "length": 3,
    "totalCount": 6
  }
}
 **/
const getCsList = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const {
    offset = 0,
    limit = 10,
    order = "desc",
  } = event.queryStringParameters;

  const connection: Connection = await getDatabaseConnection();
  const csRepository: Repository<Cs> = connection.getRepository(Cs);

  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryOrder: "DESC" | "ASC" = order.toUpperCase() as "DESC" | "ASC";

  const csEntity: [Cs[], number] = await csRepository
    .createQueryBuilder("cs")
    .orderBy("cs.createdAt", queryOrder)
    .offset(queryOffset)
    .limit(queryLimit)
    .getManyAndCount();

  const csDto: any = new CsBuilder(
    csEntity[0],
    queryOffset,
    queryLimit,
    queryOrder,
    csEntity[1]
  ).build();
  return {
    statusCode: 200,
    body: JSON.stringify(csDto),
  };
};

/**
 * @api {put}  /cms/cs/createContactCs     create contact cs
 * @apiName Create Contact Cs
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (QueryStringParam)     {string} Content                            content
 **/
const createContactCs = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const userInfo: UserData = await getUid(event.headers["Authorization"]);
  const { Content = "" } = event.queryStringParameters;
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);
  const contractCsRepository: Repository<ContactCs> = connection.getRepository(
    ContactCs
  );
  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });

  let contactCs: ContactCs = new ContactCs();
  contactCs.content = Content;
  contactCs.user = userEntity;
  await contractCsRepository.save(contactCs);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /cms/cs/:id/getContactCs     get contact cs
 * @apiName Get Contact Cs
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (PathParam)            {number} id                                 contact cs id
 * @apiParamExample response
 {
  "data": {
    "id": "1",
    "content": "contact cs test content",
    "answeringQuestions": null,
    "user": {
      "id": "12",
      "uid": "fBkfeReSGtbhEA8yTBY39kuAeyr2",
      "nickName": null,
      "phoneNumber": "+821047484856",
      "email": null
    },
    "location": null
  }
}
 **/
const getContactCs = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const contactCsId: number = Number(event.pathParameters["id"]);
  const connection: Connection = await getDatabaseConnection();
  const contactCsRepository: Repository<ContactCs> = connection.getRepository(
    ContactCs
  );
  const contactCsEntity: ContactCs = await contactCsRepository
    .createQueryBuilder("contactCs")
    .leftJoinAndSelect("contactCs.user", "user")
    .leftJoinAndSelect("user.location", "location")
    .where("contactCs.id =:id", { id: contactCsId })
    .getOne();

  if (contactCsEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }
  const contactCsDto: any = new ContactCsBuilder(contactCsEntity).build();
  return {
    statusCode: 200,
    body: JSON.stringify(contactCsDto),
  };
};

/**
 * @api {get}  /cms/cs/:id/contactCsSendAnswer     contact cs send answer
 * @apiName Contact Cs Send Answer
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (PathParam)            {number} id                                 contact cs id
 * @apiParam (QueryStringParam)     {string} Answer                             contact cs answer
 **/
const contactCsSendAnswer = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const contactCsId: number = Number(event.pathParameters["id"]);
  const { Answer = "" } = event.queryStringParameters;
  const connection: Connection = await getDatabaseConnection();
  const contactCsRepository: Repository<ContactCs> = connection.getRepository(
    ContactCs
  );
  const contactCsEntity: ContactCs = await contactCsRepository.findOne({
    id: contactCsId,
  });

  contactCsEntity.answeringQuestions = Answer;
  contactCsRepository.save(contactCsEntity);

  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /cms/cs/:id/deleteContactCs     delete contact cs
 * @apiName Delete Contact Cs
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (PathParam)            {number} id                                 contact cs id
 **/
const deleteContactCs = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const contactCsId: number = Number(event.pathParameters["id"]);
  const connection: Connection = await getDatabaseConnection();
  const contactCsRepository: Repository<ContactCs> = connection.getRepository(
    ContactCs
  );

  await contactCsRepository.delete({ id: contactCsId });
  return {
    statusCode: 200,
    body: "",
  };
};

/**
 * @api {get}  /cms/cs/getContactCsList     get contact cs list
 * @apiName Get Contact Cs List
 * @apiGroup CMS
 *
 * @apiParam (Header)               {string} AuthArization                      Bearer Token
 * @apiParam (QueryStringParam)     {number} offset=0                           list offset
 * @apiParam (QueryStringParam)     {number} limit=10                           list limit
 * @apiParam (QueryStringParam)     {string=desc,asc} order=desc                list order
 * @apiParamExample response
{
  "data": [
    {
      "id": "2",
      "content": "contact cs test content",
      "answeringQuestions": null,
      "user": {
        "id": "12",
        "uid": "fBkfeReSGtbhEA8yTBY39kuAeyr2",
        "nickName": null,
        "phoneNumber": "+821047484856",
        "email": null
      },
      "location": null
    },
    {
      "id": "3",
      "content": "a na test",
      "answeringQuestions": null,
      "user": {
        "id": "12",
        "uid": "fBkfeReSGtbhEA8yTBY39kuAeyr2",
        "nickName": null,
        "phoneNumber": "+821047484856",
        "email": null
      },
      "location": null
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 10,
    "order": "ASC",
    "length": 2,
    "totalCount": 2
  }
}
 **/

const getContactCsList = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const {
    offset = 0,
    limit = 10,
    order = "desc",
  } = event.queryStringParameters;
  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryOrder: "DESC" | "ASC" = order.toUpperCase() as "DESC" | "ASC";

  const connection: Connection = await getDatabaseConnection();
  const contactCsRepository: Repository<ContactCs> = connection.getRepository(
    ContactCs
  );
  const contactCsEntity: [
    ContactCs[],
    number
  ] = await contactCsRepository
    .createQueryBuilder("contactCs")
    .leftJoinAndSelect("contactCs.user", "user")
    .leftJoinAndSelect("user.location", "location")
    .orderBy("contactCs.updatedAt", queryOrder)
    .offset(queryOffset)
    .limit(queryLimit)
    .getManyAndCount();

  if (contactCsEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }
  const contactCsDto: any = new ContactCsListBuilder(
    contactCsEntity[0],
    queryOffset,
    queryLimit,
    queryOrder,
    contactCsEntity[1]
  ).build();
  return {
    statusCode: 200,
    body: JSON.stringify(contactCsDto),
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
const wrappedCreateCs = middy(createCs)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedModifyCs = middy(modifyCs)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedDeleteCs = middy(deleteCs)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetCsList = middy(getCsList)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedCreateContactCs = middy(createContactCs)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetContactCs = middy(getContactCs)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedContactCsSendAnswer = middy(contactCsSendAnswer)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedDeleteContactCs = middy(deleteContactCs)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetContactCsList = middy(getContactCsList)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
export {
  wrappedCreateNotice as createNotice,
  wrappedModifyNotice as modifyNotice,
  wrappedDeleteNotice as deleteNotice,
  wrappedGetNoticeList as getNoticeList,
  wrappedCreateCs as createCs,
  wrappedModifyCs as modifyCs,
  wrappedDeleteCs as deleteCs,
  wrappedGetCsList as getCsList,
  wrappedCreateContactCs as createContactCs,
  wrappedGetContactCs as getContactCs,
  wrappedContactCsSendAnswer as contactCsSendAnswer,
  wrappedDeleteContactCs as deleteContactCs,
  wrappedGetContactCsList as getContactCsList,
};
