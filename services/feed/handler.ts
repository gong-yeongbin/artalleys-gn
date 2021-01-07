import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { Connection, Repository, SelectQueryBuilder } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { PostFeedBuilder } from "../../src/dto/PostFeedDto";
import { BusinessFeedBuilder } from "../../src/dto/BusinessFeedDto";
import { Post } from "../../src/entity/Entity";
import { authorizeToken } from "../util/authorizer";
import * as middy from "middy";

const { CLOUDFRONT_IMAGE } = process.env;

/**
 * @api {get}  /feed/getFeed     get Feed
 * @apiName Get Feed
 * @apiGroup Feed
 *
 * @apiParam (Header)   {string}  Authorization                                        Bearer Token
 * @apiParam (QueryStringParam) {Number}[offset=0] offset                              offset
 * @apiParam (QueryStringParam) {Number}[limit=10] limit                               limit
 * @apiParam (QueryStringParam) {String=sell,buy} type                                 type
 * 
 * @apiParam (body) {Array} [setCategory]       setCategory                            category
 * @apiParam (body) {Array} [setFilter=newest]  setfilter                              filter 
 * @apiParam (body) {Array} [setPrice] setPrice                                        price
 * @apiParam (body) {Array} [setPrice] setPrice.min                                    min price
 * @apiParam (body) {Array} [setPrice] setPrice.max                                    max price
 * @apiParam (body) {boolean} [hide] hide                                              hide
 *
 * @apiParamExample request
{	
	"setCategory": ["pants","t-shirt"],
	"setFilter": "newest",
	"setPrice":	{		
									"min":0,
									"max":1001
						 	}
}
 * @apiParamExample response
 {
  "data": [
    {
      "postId": "58e438d67f0c0fb1e256",
      "title": "hwajangpyoom",
      "view": 0,
      "price": 1000,
      "active": "active",
      "url": "d19j7dhfxgaxy7.cloudfront.net/post/58e438d67f0c0fb1e256/origin/7f21ce6a10bc4a75.png"
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 10,
    "order": "ASC",
    "total": 1,
    "count": 1
  }
}
 **/

const getFeed = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const { offset = 0, limit = 10, type = "sell" } = event.queryStringParameters;
  const {
    setCategory,
    setFilter = "newest",
    setPrice,
    hide = false,
  } = JSON.parse(event.body);

  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);

  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryType: string = type;
  const querySetCategory: string[] = setCategory;
  const queryOrder: "DESC" | "ASC" =
    setFilter.toLowerCase() == "newest | closest" ? "DESC" : "ASC";
  const queryOrderType: string =
    setFilter.toLowerCase() == "newest" ? "post.updated_at" : "";

  const querySetPriceMin: number = setPrice != null ? setPrice.min : null;
  const querySetPriceMax: number = setPrice != null ? setPrice.max : null;

  let totalquery = postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.normal", "normal")
    .leftJoinAndSelect("post.postImage", "postImage")
    .where("post.hide = false AND normal.type = :isType", { isType: queryType })
    .andWhere("normal.active = :isActive", { isActive: hide })
    .andWhere("normal.category NOT IN (:isCategory)", {
      isCategory: querySetCategory,
    })
    .orderBy(queryOrderType, queryOrder);

  let query: SelectQueryBuilder<Post> = postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.normal", "normal")
    .leftJoinAndSelect("post.postImage", "postImage")
    .where("post.hide = false AND normal.type = :isType", { isType: queryType })
    .andWhere("normal.active = :isActive", { isActive: hide })
    .andWhere("normal.category NOT IN (:isCategory)", {
      isCategory: querySetCategory,
    })
    .orderBy(queryOrderType, queryOrder)
    .offset(queryOffset)
    .limit(queryLimit);

  if (setPrice != null) {
    query = query.andWhere("normal.price between :isMin and :isMax", {
      isMin: querySetPriceMin,
      isMax: querySetPriceMax,
    });
  }
  const postEntity: Post[] = await query.getMany();
  const postEntityTotalCount: number = await totalquery.getCount();

  const metadata = {
    offset: queryOffset,
    limit: queryLimit,
    order: queryOrder,
    total: postEntityTotalCount,
    count: postEntity.length,
  };

  const feedDto: any = new PostFeedBuilder(postEntity, metadata)
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
export const getBusinessFeed = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const {
    offset = 0,
    limit = 10,
    type = "sell",
    order = "DESC",
  } = event.queryStringParameters;
  const connection: Connection = await getDatabaseConnection();
  const postRepository: Repository<Post> = connection.getRepository(Post);

  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryOrder: "ASC" | "DESC" =
    order.toUpperCase() == "ASC" ? "ASC" : "DESC";

  const postEntity: Post[] = await postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.business", "business")
    .leftJoinAndSelect("post.postImage", "postImage")
    .where("post.hide = false")
    .orderBy("post.updated_at", queryOrder)
    .offset(queryOffset)
    .limit(queryLimit)
    .getMany();

  const feedDto: any = new BusinessFeedBuilder(postEntity)
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(feedDto),
  };
};

/**
 * @api {get}  /feed/getSearchFeed     get Search Feed
 * @apiName Get Search Feed
 * @apiGroup Feed
 *
 * @apiParam (QueryStringParam) {Number}[offset=0] offset                               offset
 * @apiParam (QueryStringParam) {Number}[limit=10] limit                                limit
 * @apiParam (Body) {String=buy,sell} type                                              type
 * @apiParam (Body) {String} search                                                     search
 * @apiParam (Body) {String=newest,closest,price}[setFilter="newest"]                   setFilter
 * @apiParam (Body) {String=DESC,ASC}[order="DESC"]                                     order
 * @apiParam (Body) {Boolean}[hide="false"]                                             hide
  * @apiParamExample request
{	
  "type": "buy"
	"search":"hwajangpyoom",
	"setFilter": "newest",
	"setPrice":	{		
									"min":0,
									"max":1001
               },
  "order": "DESC",
	"hide": false
}
 * @apiParamExample response
[
  {
    "postId": "e085b6dc01c7cce649f9",
    "title": "hwajangpyoom",
    "view": 0,
    "price": 1001,
    "active": "active",
    "url": "d19j7dhfxgaxy7.cloudfront.net/testuid/post/e085b6dc01c7cce649f9/origin/670833fe0d2b4920.png"
  },
  {
    "postId": "b96ff8643d495ce9777a",
    "title": "hwajangpyoom",
    "view": 0,
    "price": 1000,
    "active": "active",
    "url": "d19j7dhfxgaxy7.cloudfront.net/testuid/post/b96ff8643d495ce9777a/origin/ce15063e128c7a63.png"
  }
]
 **/
export const getSearchFeed = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);

  const { offset = 0, limit = 10 } = event.queryStringParameters;

  const {
    type,
    search,
    setFilter = "newest",
    setPrice,
    order,
    hide = false,
  } = JSON.parse(event.body);

  const queryType: "sell" | "buy" = type;
  const querySearch: string = search;
  const queryPriceMin: number = setPrice.min;
  const queryPriceMax: number = setPrice.max;
  const queryOrder: "DESC" | "ASC" =
    order.toUpperCase() == "DESC" ? "DESC" : "ASC";

  const queryOrderType: string =
    setFilter.toLowerCase() == "newest"
      ? "post.updated_at"
      : setFilter.toLowerCase() == "price"
      ? "normal.price"
      : "";

  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);

  let query = postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.normal", "normal")
    .leftJoinAndSelect("post.postImage", "image")
    .where("normal.type = :type", { type: queryType })
    .andWhere("post.title like :title", { title: `%${querySearch}%` })
    .orderBy(queryOrderType, queryOrder)
    .offset(queryOffset)
    .limit(queryLimit);

  if (hide != null && hide == true) {
    query = query.andWhere("normal.active != :isHide", { isHide: "soldout" });
  }

  if (setPrice != null) {
    query = query.andWhere("normal.price between :isMin and :isMax", {
      isMin: queryPriceMin,
      isMax: queryPriceMax,
    });
  }

  const postEntity: Post[] = await query.getMany();

  const postDto: any = new PostFeedBuilder(postEntity)
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();
  return {
    statusCode: 200,
    body: JSON.stringify(postDto),
  };
};

/**
 * @api {get}  /feed/getCategoryFeed     get Category Feed
 * @apiName Get Category Feed
 * @apiGroup Feed
 *
 * @apiParam (QueryStringParam) {Number}[offset=0] offset                               offset
 * @apiParam (QueryStringParam) {Number}[limit=10] limit                                limit
 * @apiParam (Body) {String=buy,sell} type                                              type
 * @apiParam (Body) {String} category                                                   category
 * @apiParam (Body) {String=newest,closest,price}[setFilter="newest"]                   setFilter
 * @apiParam (Body) {String=DESC,ASC}[order="DESC"]                                     order
 * @apiParam (Body) {Boolean}[hide="false"]                                             hide
  * @apiParamExample request
{	
  "type": "buy"
	"category":"hwajangpyoom category",
	"setFilter": "newest",
	"setPrice":	{		
									"min":0,
									"max":1001
               },
  "order": "DESC",
	"hide": false
}
 * @apiParamExample response
[
  {
    "postId": "e085b6dc01c7cce649f9",
    "title": "hwajangpyoom",
    "view": 0,
    "price": 1000,
    "active": "active",
    "url": "d19j7dhfxgaxy7.cloudfront.net/testuid/post/e085b6dc01c7cce649f9/origin/670833fe0d2b4920.png"
  },
  {
    "postId": "b96ff8643d495ce9777a",
    "title": "hwajangpyoom",
    "view": 0,
    "price": 1000,
    "active": "active",
    "url": "d19j7dhfxgaxy7.cloudfront.net/testuid/post/b96ff8643d495ce9777a/origin/ce15063e128c7a63.png"
  }
]
 **/

export const getCategoryFeed = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);

  const { offset = 0, limit = 10 } = event.queryStringParameters;

  const {
    type,
    category,
    setFilter = "newest",
    setPrice,
    order,
    hide = false,
  } = JSON.parse(event.body);

  const queryType: "sell" | "buy" = type;
  const queryCategory: string = category;
  const queryPriceMin: number = setPrice.min;
  const queryPriceMax: number = setPrice.max;
  const queryOrder: "DESC" | "ASC" =
    order.toUpperCase() == "DESC" ? "DESC" : "ASC";

  const queryOrderType: string =
    setFilter.toLowerCase() == "newest"
      ? "post.updated_at"
      : setFilter.toLowerCase() == "price"
      ? "normal.price"
      : "";

  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);

  let query = postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.normal", "normal")
    .leftJoinAndSelect("post.postImage", "image")
    .where("normal.type = :type", { type: queryType })
    .andWhere("normal.category = :category", { category: queryCategory })
    .orderBy(queryOrderType, queryOrder)
    .offset(queryOffset)
    .limit(queryLimit);

  if (hide != null && hide == true) {
    query = query.andWhere("normal.active != :isHide", { isHide: "soldout" });
  }

  if (setPrice != null) {
    query = query.andWhere("normal.price between :isMin and :isMax", {
      isMin: queryPriceMin,
      isMax: queryPriceMax,
    });
  }

  const postEntity: Post[] = await query.getMany();

  const postDto: any = new PostFeedBuilder(postEntity)
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(postDto),
  };
};

const wrappedGetFeed = middy(getFeed).use(authorizeToken());

export { wrappedGetFeed as getFeed };
