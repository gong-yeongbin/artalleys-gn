import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "../util/authorizer";
import { getUid } from "../util/util";
import { PostCategory } from "../../src/entity/Entity";

/**
 * @api {get}  /common/getPostCategory     get post category
 * @apiName Get Post Category
 * @apiGroup Common
 *
 * @apiParam (Header)   {string} AuthArization                              Bearer Token
 * @apiParamExample {json} Request Body
 [
  {
    "id": "1",
    "category": "Antiques & Collectibles"
  },
  {
    "id": "2",
    "category": "Arts & Crafts"
  },
  {
    "id": "3",
    "category": "Baby & Kids"
  },
  {
    "id": "12",
    "category": "Books, CDs & Vinyl"
  },
  {
    "id": "4",
    "category": "Clothing, Shoes and Accessories"
  },
  {
    "id": "5",
    "category": "Consumer Electronics"
  },
  {
    "id": "6",
    "category": "Games, Toys & Hobbies"
  },
  {
    "id": "7",
    "category": "Health & Beauty"
  },
  {
    "id": "8",
    "category": "Home & Garden"
  },
  {
    "id": "9",
    "category": "Home & Interior"
  },
  {
    "id": "13",
    "category": "Luggage & Travel Gear"
  },
  {
    "id": "10",
    "category": "Motors & Bikes"
  },
  {
    "id": "11",
    "category": "Musical Instruments"
  },
  {
    "id": "14",
    "category": "Office Products"
  },
  {
    "id": "17",
    "category": "Others"
  },
  {
    "id": "15",
    "category": "Pet Supplies"
  },
  {
    "id": "16",
    "category": "Sports & Outdoors"
  }
]
 * @apiSuccess (200 OK) {String} NoContent                              Success
 **/

const getPostCategory = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection = await getDatabaseConnection();
  const postCategoryRepository: Repository<PostCategory> = connection.getRepository(
    PostCategory
  );
  const postCategoryEntity: PostCategory[] = await postCategoryRepository.find();

  if (postCategoryEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(postCategoryEntity),
  };
};

const wrappedGetPostCategory = middy(getPostCategory)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
export { wrappedGetPostCategory as getPostCategory };
