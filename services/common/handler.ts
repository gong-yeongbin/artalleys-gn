import { APIGatewayEvent, Context, ProxyResult, S3Event } from "aws-lambda";
import { Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "../util/authorizer";
import { getUid, filepath } from "../util/util";
import { BusinessCategory, PostCategory } from "../../src/entity/Entity";
import { getSignedUrl } from "../../services/util/aws";
import { SignedUrlData, UserData } from "../../src/types/dataType";
import { Image, Notice } from "../../src/entity/Entity";
import { NoticeGetBuilder } from "../../src/dto/NoticeGetDto";

const {
  BUCKET_NAME,
  CLOUDFRONT_IMAGE,
  IMAGE_UPLOAD_EXPIRES,
  BUCKET_SERVICE_ENDPOINT_URL,
} = process.env;
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

/**
 * @api {get}  /common/getBusinessCategory     get business category
 * @apiName Get Business Category
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
const getBusinessCategory = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const connection = await getDatabaseConnection();
  const businessCategoryRepository: Repository<BusinessCategory> = connection.getRepository(
    BusinessCategory
  );
  const businessCategoryEntity: BusinessCategory[] = await businessCategoryRepository.find();

  if (businessCategoryEntity == null) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(businessCategoryEntity),
  };
};

/**
 * @api {post}  /common/getImageSignedUrl     get image signed url
 * @apiName Get Image Signed Url
 * @apiGroup Common
 *
 * @apiParam (Header)   {string} AuthArization                              Bearer Token
 * @apiParam (QueryStringParam) {String=post,business,businessPost,user} type                               post type
 * @apiParam (QueryStringParam) {Array} filename                           file name
 * @apiParamExample {json} Request Body
 {
  "type": "post",
	"filenames": ["test.png", "test1.jpg"]	
 }
 * @apiParamExample {json} Response Body
[
  {
    "url": "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/image/52b8d7f22fb969e65bea3edf4e9dc20549170aec.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR2USP7BWOC27YG4P%2F20210120%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20210120T073045Z&X-Amz-Expires=900&X-Amz-Signature=bb40b30392d44d0084808cd1a6d02a88b46b197b5e46490ca669dc1fb1d92b2f&X-Amz-SignedHeaders=host",
    "key": "image/52b8d7f22fb969e65bea3edf4e9dc20549170aec.png",
    "href": "https://d19j7dhfxgaxy7.cloudfront.netimage/52b8d7f22fb969e65bea3edf4e9dc20549170aec.png",
    "expireInSeconds": 900
  },
  {
    "url": "https://artalleys-gn-image-bucket.s3.us-east-2.amazonaws.com/image/9412b995664041cf3c1af096ba5b7aa2d9c84624.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR2USP7BWOC27YG4P%2F20210120%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20210120T073045Z&X-Amz-Expires=900&X-Amz-Signature=f829f069f9b8fdb5cc1bd4d98e37ba22b39db856c1467da26da25f51b65e1921&X-Amz-SignedHeaders=host",
    "key": "image/9412b995664041cf3c1af096ba5b7aa2d9c84624.jpeg",
    "href": "https://d19j7dhfxgaxy7.cloudfront.netimage/9412b995664041cf3c1af096ba5b7aa2d9c84624.jpeg",
    "expireInSeconds": 900
  }
]
 * @apiSuccess (200 OK) {String} NoContent                              Success
 **/
const getImageSignedUrl = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const userInfo: UserData = await getUid(event.headers["Authorization"]);
  const { filenames, type } = JSON.parse(event.body);

  let response: SignedUrlData[] = [];

  for (let index in filenames) {
    let key: string = [userInfo.uid, filepath(filenames[index], type)].join(
      "/"
    );

    let signedUrl: string = await getSignedUrl("putObject", {
      Bucket: BUCKET_NAME,
      Key: key,
    });

    response.push({
      url: signedUrl,
      key: key,
      href: CLOUDFRONT_IMAGE + key,
      expireInSeconds: Number(IMAGE_UPLOAD_EXPIRES),
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};

/**
 * @api {get}  /common/getNotice    get notice
 * @apiName Get Notice
 * @apiGroup common
 *
 * @apiParam (QueryStringParam) {Number} offset                            offset
 * @apiParam (QueryStringParam) {Number} limit                             limit
 * @apiParam (QueryStringParam) {String} order                             order
 *
 *
 * @apiParamExample {json} Response
{
  "data": [
    {
      "id": "4",
      "title": "notice test",
      "category": "Notice",
      "content": "notice test content",
      "createdAt": "2021-01-20T22:26:58.982Z",
      "updatedAt": "2021-01-20T22:26:58.982Z"
    },
    {
      "id": "5",
      "title": "notice test",
      "category": "Event",
      "content": "notice test content",
      "createdAt": "2021-01-20T22:27:03.523Z",
      "updatedAt": "2021-01-20T22:27:03.523Z"
    }
  ],
  "_meta": {
    "offset": 0,
    "limit": 2,
    "length": 2,
    "totalCount": 2
  }
}
 **/

const getNotice = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const { offset = 0, limit = 10, order } = event.queryStringParameters;
  const queryOffset: number = Number(offset);
  const queryLimit: number = Number(limit);
  const queryOrder: "DESC" | "ASC" = order.toUpperCase() as "DESC" | "ASC";

  const connection = await getDatabaseConnection();
  const noticeRepository: Repository<Notice> = connection.getRepository(Notice);
  const noticeEntity: Notice[] = await noticeRepository.find({
    where: { publish: true },
    order: { createdAt: queryOrder },
    skip: queryOffset,
    take: queryLimit,
  });
  const totalCount: number = await noticeRepository.count({
    where: { publish: true },
  });

  const noticeDto: any = new NoticeGetBuilder(
    noticeEntity,
    queryOffset,
    queryLimit,
    totalCount
  ).build();

  return {
    statusCode: 200,
    body: JSON.stringify(noticeDto),
  };
};

const wrappedGetPostCategory = middy(getPostCategory)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetBusinessCategory = middy(getBusinessCategory)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetImageSignedUrl = middy(getImageSignedUrl)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetNotice = middy(getNotice)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export {
  wrappedGetPostCategory as getPostCategory,
  wrappedGetBusinessCategory as getBusinessCategory,
  wrappedGetImageSignedUrl as getImageSignedUrl,
  wrappedGetNotice as getNotice,
};
