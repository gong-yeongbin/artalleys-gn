import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { PostFeedBuilder } from "../../src/dto/PostFeedDto";

import { Post } from "../../src/entity/Entity";
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
 * @apiParam (body) {Array} filter=newest                                      filter
 * @apiParam (body) {Array} price                                              price
 * @apiParam (body) {Array} price min                                          min
 * @apiParam (body) {Array} price max                                          max
 * @apiParam (body) {boolean} hide                                             hide
 * @apiParam (body) {String} search                                              search
 *
 * @apiParamExample request
{	
	"category": ["Antiques & Collectibles"],
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
  const {
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
  const querySetCategory: string[] = category;
  const queryOrder: "DESC" | "ASC" =
    filter.toLowerCase() == "newest" ? "DESC" : "ASC";
  const queryOrderType: string =
    filter.toLowerCase() == "newest" ? "post.updated_at" : "";
  const queryPriceMin: number = price != null ? price.min : null;
  const queryPriceMax: number = price != null ? price.max : null;
  const querySearch: string = search;
  const totalCount: number = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.type", "type")
    .leftJoinAndSelect("post.category", "category")
    .where("type.type =:type", { type: queryType })
    .andWhere("post.hide =:hide", { hide: hide })
    .andWhere("category.category IN (:category)", {
      category: querySetCategory,
    })
    .getCount();

  let query = postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.image", "image")
    .leftJoinAndSelect("post.type", "type")
    .leftJoinAndSelect("post.category", "category")
    .leftJoinAndSelect("post.status", "status")
    .where("type.type = :type", { type: queryType })
    .andWhere("post.hide = :hide", { hide: hide })
    .andWhere("category.category IN (:category)", {
      category: querySetCategory,
    })
    .andWhere("post.title like :title", { title: `%${querySearch}%` })
    .orderBy(queryOrderType, queryOrder)
    .offset(queryOffset)
    .limit(queryLimit);

  if (price != null) {
    query = query.andWhere("post.price between :min and :max", {
      min: queryPriceMin,
      max: queryPriceMax,
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
 * @apiParam (QueryStringParam) {String=DESC,ASC} order                                order
 *
 *
 * @apiParamExample response
 [
  {
    "postId": "4f62a7cb423ac3ff3faf",
    "title": "business title",
    "url": "d19j7dhfxgaxy7.cloudfront.net/testuid/post/4f62a7cb423ac3ff3faf/origin/65fe1202ae6419bd.png"
  },
  {
    "postId": "b96ff8643d495ce9777a",
    "title": "hwajangpyoom",
    "url": "d19j7dhfxgaxy7.cloudfront.net/testuid/post/b96ff8643d495ce9777a/origin/ce15063e128c7a63.png"
  },
  {
    "postId": "e085b6dc01c7cce649f9",
    "title": "hwajangpyoom",
    "url": "d19j7dhfxgaxy7.cloudfront.net/testuid/post/e085b6dc01c7cce649f9/origin/670833fe0d2b4920.png"
  }
]
 **/
// export const getBusinessFeed = async (
//   event: APIGatewayEvent,
//   context: Context
// ): Promise<ProxyResult> => {
//   const {
//     offset = 0,
//     limit = 10,
//     type = "sell",
//     order = "DESC",
//   } = event.queryStringParameters;
//   const connection = await getDatabaseConnection();
//   const postRepository = connection.getRepository(Post);

//   const queryOffset: number = Number(offset);
//   const queryLimit: number = Number(limit);
//   const queryOrder: "ASC" | "DESC" =
//     order.toUpperCase() == "ASC" ? "ASC" : "DESC";

//   const postEntity: Post[] = await postRepository
//     .createQueryBuilder("post")
//     .leftJoinAndSelect("post.business", "business")
//     .leftJoinAndSelect("post.postImage", "postImage")
//     .where("post.hide = false")
//     .orderBy("post.updated_at", queryOrder)
//     .offset(queryOffset)
//     .limit(queryLimit)
//     .getMany();

//   const feedDto: BusinessFeedData[] = new BusinessFeedBuilder(postEntity)
//     .replaceHost(CLOUDFRONT_IMAGE)
//     .build();

//   return {
//     statusCode: 200,
//     body: JSON.stringify(feedDto),
//   };
// };

const wrappedGetFeed = middy(getFeed)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export { wrappedGetFeed as getFeed };
