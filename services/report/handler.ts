import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { Connection, Repository } from "typeorm";
import {
  User,
  Post,
  Business,
  BusinessPost,
  Report,
  ReportCategory,
} from "../../src/entity/Entity";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { authorizeToken } from "../util/authorizer";
import { UserData } from "../../src/types/dataType";
import { getUid } from "../util/util";
import { getDatabaseConnection } from "../../src/connection/Connection";

/**
 * @api {post}  /report/:postId/reportPost     report psot
 * @apiName Report Post
 * @apiGroup Report
 *
 * @apiParam (Header)   {string} AuthArization                                        Bearer Token
 * @apiParam (Body)     {string=post,business,businessPost} type                      type
 * @apiParam (Body)     {number=reportCategoryCode} category                          category
 * @apiParam (Body)     {string} content                                              content
 *
 *
 * @apiParamExample {json} Request Body
{
	"type": "Post",
	"category": 1,
	"content":"omg"
}
 * @apiSuccess (200 OK) {String} NoContent                              Success
 **/

const reportPost = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const postId: number = Number(event.pathParameters["id"]);
  let { type = "Post", category = 1, content }: any = JSON.parse(event.body);

  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository("User");
  const reportCategoryRepository: Repository<ReportCategory> = connection.getRepository(
    "ReportCategory"
  );
  const genericRepository: Repository<
    Post | Business | BusinessPost
  > = connection.getRepository(type);

  const userEntity: User = await userRepository.findOne({ uid: userInfo.uid });
  const reportCategoryEntity: ReportCategory = await reportCategoryRepository.findOne(
    { id: Number(category) }
  );
  const genericEntity:
    | Post
    | Business
    | BusinessPost = await genericRepository.findOne({ id: postId });

  if (
    userEntity == null ||
    reportCategoryEntity == null ||
    genericEntity == null
  ) {
    return {
      statusCode: 500,
      body: "",
    };
  }

  const reportRepository: Repository<Report> = connection.getRepository(
    "Report"
  );
  let report: Report = new Report();
  report.user = userEntity;
  report.category = reportCategoryEntity;
  report.content = content;

  if (type == "Post") {
    report.post = genericEntity as Post;
  } else if (type == "Business") {
    report.business = genericEntity as Business;
  } else {
    report.businessPost = genericEntity as BusinessPost;
  }

  await reportRepository.save(report);

  return {
    statusCode: 200,
    body: "",
  };
};

const wrappedReportPost = middy(reportPost)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());

export { wrappedReportPost as reportPost };
