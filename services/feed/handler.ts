import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { FeedBuilder, PostData } from "../../src/dto/feed/FeedDto";
import { Post } from "../../src/entity/Post";

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
 *
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
  {
    "postId": "841e68012ce1a3cd5054e01964ca55",
    "title": "hwajangpyoom",
    "price": 1000,
    "active": "active",
    "url": "d19j7dhfxgaxy7.cloudfront.net/test1/841e68012ce1a3cd5054e01964ca55/origin.png"
  },
  {
    "postId": "19e9a096d46bbfe4cf015773fa1a23",
    "title": "hwajangpyoom",
    "price": 1000,
    "active": "active",
    "url": "d19j7dhfxgaxy7.cloudfront.net/test1/19e9a096d46bbfe4cf015773fa1a23/origin.png"
  },
  {
    "postId": "f332ba8f94be86cb1390d0b1c0a44e",
    "title": "hwajangpyoom",
    "price": 1000,
    "active": "active",
    "url": "d19j7dhfxgaxy7.cloudfront.net/test1/f332ba8f94be86cb1390d0b1c0a44e/origin.png"
  }
]
 **/

export const getFeed = async (
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
    .leftJoinAndSelect("post.postImage", "postImage")
    .where("post.hide = false AND post.type = :type", { type: type })
    .orderBy("post.updated_at", queryOrder)
    .offset(queryOffset)
    .limit(queryLimit)
    .getMany();

  const feedDto: PostData[] = new FeedBuilder(postEntity)
    .replaceHost(CLOUDFRONT_IMAGE)
    .build();

  return {
    statusCode: 200,
    body: JSON.stringify(feedDto),
  };
};
