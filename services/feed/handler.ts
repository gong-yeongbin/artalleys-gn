import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { PostFeedBuilder } from "../../src/dto/PostFeedDto";
import { BusinessFeedBuilder } from "../../src/dto/BusinessFeedDto";

import { Business, Post } from "../../src/entity/Entity";
import { authorizeToken } from "../util/authorizer";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";

const { CLOUDFRONT_IMAGE } = process.env;

/**
 * @api {put}  /feed/getFeed     get Feed
 * @apiName Get Feed
 * @apiGroup Feed
 * 
 * @apiParam (QueryStringParam) {Number}[offset=0]                               offset
 * @apiParam (QueryStringParam) {Number}[limit=10]                               limit
 * @apiParam (QueryStringParam) {String=sell,buy} type                           type
 *
 * @apiParam (body) {Array} category                                           category
 * @apiParam (body) {Array=newest,price_lh,price_hl} filter=newest                   filter
 * @apiParam (body) {Array} price                                              price
 * @apiParam (body) {Array} price min                                          min
 * @apiParam (body) {Array} price max                                          max
 * @apiParam (body) {boolean} hide                                             hide
 * @apiParam (body) {String} search                                              search
 *
 * @apiParamExample request
{	
	"category": [1,2,3],
	"filter": "newest",
	"price":	{		
									"min":0,
									"max":1000000
						 	},
	"hide":false,
	"search":""
}
 * @apiParamExample response
 {
  "data": [
    {
      "id": "19",
      "status": "active",
      "category": "Antiques & Collectibles",
      "price": 100000,
      "url": "d19j7dhfxgaxy7.cloudfront.net/image/0eb30f28-1223-4482-9873-17ce2f382777.png"
    },
    {
      "id": "18",
      "status": "active",
      "category": "Antiques & Collectibles",
      "price": 100000,
      "url": "d19j7dhfxgaxy7.cloudfront.net/image/74f142df-8e02-49aa-8787-0c9c06b2d155.png"
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 10,
    "order": "DESC",
    "totalCount": 2
  }
}
 **/

const getFeed = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const { offset = 0, limit = 10, type = "sell" } = event.queryStringParameters;
  let {
    category,
    filter = "newest",
    price,
    hide = false,
    search = "",
  } = JSON.parse(event.body);

  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);

  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryType: string = type;

  const querySetCategory: number[] = category.length != 0 ? category : 0;
  // desc - newest, price_hl
  // asc - closest, price_lh
  filter = filter.toLowerCase();
  const queryOrder: "DESC" | "ASC" =
    filter == "newest" || filter == "price_hl" ? "DESC" : "ASC";

  let queryOrderType: string = "";
  if (filter == "newest") {
    queryOrderType = "post.updated_at";
  } else if (filter == "price_hl" || "price_lh") {
    queryOrderType = "post.price";
  }

  const querySearch: string = search;

  const totalCount: number = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.image", "image")
    .leftJoinAndSelect("post.type", "type")
    .leftJoinAndSelect("post.category", "category")
    .leftJoinAndSelect("post.status", "status")
    .where("type.type = :type", { type: queryType })
    .andWhere("post.hide = :hide", { hide: hide })
    .andWhere("post.category IN ( :category)", {
      category: querySetCategory,
    })
    .andWhere("post.title like :title", { title: `%${querySearch}%` })
    .getCount();

  let query = postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.image", "image")
    .leftJoinAndSelect("post.type", "type")
    .leftJoinAndSelect("post.category", "category")
    .leftJoinAndSelect("post.status", "status")
    .where("type.type = :type", { type: queryType })
    .andWhere("post.hide = :hide", { hide: hide })
    .andWhere("post.category IN ( :category)", {
      category: querySetCategory,
    })
    // .andWhere("post.title like :title", { title: `%${querySearch}%` })
    // .orderBy(queryOrderType, queryOrder)
    .skip(queryOffset)
    .take(queryLimit);

  if (price != null && price.max != 0) {
    query = query.andWhere("post.price between :min and :max", {
      min: price.min,
      max: price.max,
    });
  }

  const postEntity: Post[] = await query.getMany();

  const feedDto: any = new PostFeedBuilder(
    postEntity,
    queryOffset,
    queryLimit,
    queryOrder,
    totalCount
  )
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(feedDto),
  };
};

/**
 * @api {get}  /feed/getBusinessFeed     get Business Feed
 * @apiName Get Business Feed
 * @apiGroup Feed
 *
 * @apiParam (QueryStringParam) {Number}[offset=0] offset                              offset
 * @apiParam (QueryStringParam) {Number}[limit=10] limit                               limit
 *
 *
 * @apiParamExample response
{
  "data": [
    {
      "id": "26",
      "title": "business title",
      "businessHoursInfo": "test businessHoursInfo",
      "url": "https://d19j7dhfxgaxy7.cloudfront.net/business/39489e5be288970c5437b7a94917f54038bb48ff.png"
    },
    {
      "id": "27",
      "title": "business title",
      "businessHoursInfo": "test businessHoursInfo",
      "url": "https://d19j7dhfxgaxy7.cloudfront.net/business/39489e5be288970c5437b7a94917f54038bb48ff.png"
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 2,
    "length": 2,
    "totalCount": 3
  }
}
 **/
const getBusinessFeed = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const { offset = 0, limit = 10 } = event.queryStringParameters;
  const connection = await getDatabaseConnection();
  const businessRepository = connection.getRepository(Business);

  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);

  const totalCount: number = await businessRepository
    .createQueryBuilder("business")
    .leftJoinAndSelect("business.image", "image")
    .where("business.hide = false")
    .offset(queryOffset)
    .limit(queryLimit)
    .getCount();

  const businessEntity: Business[] = await businessRepository
    .createQueryBuilder("business")
    .leftJoinAndSelect("business.image", "image")
    .where("business.hide = false")
    .orderBy("business.id", "DESC")
    .skip(queryOffset)
    .take(queryLimit)
    .getMany();

  const businessFeedDto: any = new BusinessFeedBuilder(
    businessEntity,
    queryOffset,
    queryLimit,
    totalCount
  )
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(businessFeedDto),
  };
};

const wrappedGetFeed = middy(getFeed)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetBusinessFeed = middy(getBusinessFeed)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export { wrappedGetFeed as getFeed, wrappedGetBusinessFeed as getBusinessFeed };
