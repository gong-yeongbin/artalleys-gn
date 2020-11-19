import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { PostFeedBuilder, PostFeedData } from "../../src/dto/PostFeedDto";
import {
  BusinessFeedBuilder,
  BusinessFeedData,
} from "../../src/dto/BusinessFeedDto";
import { Post } from "../../src/entity/Entity";

const { CLOUDFRONT_IMAGE } = process.env;

/**
 * @api {get}  /feed/getFeed     get Feed
 * @apiName Get Feed
 * @apiGroup Feed
 *
 * @apiParam (QueryStringParam) {Number}[offset=0] offset                              offset
 * @apiParam (QueryStringParam) {Number}[limit=10] limit                               limit
 * @apiParam (QueryStringParam) {String=DESC,ASC} order                                order
 * @apiParam (QueryStringParam) {String=sell,buy} type                                 type
 * 
 * @apiParam (body) {Array} [setCategory]       setCategory                            category
 * @apiParam (body) {Array} [setFilter=newest]  setfilter                              filter 
 * @apiParam (body) {Array} [setPrice] setPrice                                        price
 * @apiParam (body) {Array} [setPrice] setPrice.min                                    min price
 * @apiParam (body) {Array} [setPrice] setPrice.max                                    max price
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
 [
  {
    "postId": "d59704d14321b9c785d350ea596d98",
    "title": "hwajangpyoom",
    "price": 1000,
    "active": "active",
    "url": "d19j7dhfxgaxy7.cloudfront.net/test1/d59704d14321b9c785d350ea596d98/origin.png"
  },
  {
    "postId": "cf5e31252c127cc003cf4d621fb289",
    "title": "hwajangpyoom",
    "price": 1000,
    "active": "active",
    "url": "d19j7dhfxgaxy7.cloudfront.net/test1/cf5e31252c127cc003cf4d621fb289/origin.png"
  },
]
 **/

export const getFeed = async (
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

  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);

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

  let query = postRepository
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.normal", "normal")
    .leftJoinAndSelect("post.postImage", "postImage")
    .where("post.hide = false AND normal.type = :isType", { isType: queryType })
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

  const feedDto: PostFeedData[] = new PostFeedBuilder(postEntity)
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
  const connection = await getDatabaseConnection();
  const postRepository = connection.getRepository(Post);

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

  const feedDto: BusinessFeedData[] = new BusinessFeedBuilder(postEntity)
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(feedDto),
  };
};
