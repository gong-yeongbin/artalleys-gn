import { APIGatewayEvent, Context, ProxyResult } from "aws-lambda";
import { Connection, Repository } from "typeorm";
import { getDatabaseConnection } from "../../src/connection/Connection";
import { authorizeToken } from "../util/authorizer";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import { User } from "../../src/entity/Entity";
import { getUid } from "../util/util";
import { UserData } from "../../src/types/dataType";

/**
 * @api {get}  /user/joinUser     Join User
 * @apiName Join User
 * @apiGroup User
 *
 * @apiParam (Header)     {string}  Authorization                         Bearer Token
 *
 * @apiSuccess  (200 OK) {String} NoContent           Success
 * @apiError    (404 Not Found)   ResourceNotFound    This resource cannot be found
 **/

const joinUser = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  const token: string = event.headers["Authorization"];
  const userInfo: UserData = await getUid(token);
  const connection: Connection = await getDatabaseConnection();
  const userRepository: Repository<User> = connection.getRepository(User);

  const userEntity: User = await userRepository.findOne({
    uid: userInfo.uid,
  });

  let user: User = new User();

  if (userEntity == null || userEntity == undefined) {
    user.uid = userInfo.uid;
    user.phoneNumber = userInfo.phoneNumber;
    await userRepository.save(user);
  }

  return {
    statusCode: 200,
    body: "",
  };
};

import * as googleMaps from "@google/maps";

const getLocation = async (
  event: APIGatewayEvent,
  context: Context
): Promise<ProxyResult> => {
  var googleMapsClient = googleMaps.createClient({
    key: "AIzaSyC9bONXxtEBd8UOI8-QhoI8APPMsbV43ik",
  });
  // googleMapsClient.geocode(
  //   {
  //     components: {
  //       postal_code: "95014",
  //     },
  //   },
  //   function (err, response) {
  //     if (!err) {
  //       console.log(response.json.results[0].geometry.location);
  //     }
  //   }
  // );
  // googleMapsClient.reverseGeocode(
  //   {
  //     latlng: [37.33497, -122.00909],
  //   },
  //   function (err, response) {
  //     if (!err) {
  //       console.log(response.json.results[0].formatted_address.split(",")[1]);
  //       console.log(response.json.results[0].formatted_address.split(",")[2]);
  //       console.log(response.json.results[0].formatted_address.split(",")[3]);
  //       console.log(response.json.results[0].formatted_address);
  //     }
  //   }
  // );

  // ex)
  // const user = await getConnection()
  //     .createQueryBuilder()
  //     .select("user")
  //     .from(User, "user")
  //     .where("user.id = :id", { id: 1 })
  //     .getOne();

  //   SELECT *,
  // 	(6371*acos(cos(radians(37.4685225))*cos(radians(latitude))*cos(radians(longitude)-radians(126.8943311))+sin(radians(37.4685225))*sin(radians(latitude))))
  // 	AS distance
  // FROM gn.location
  // HAVING distance <= 100
  // ORDER BY distance

  // 마일
  // 1km == 0.621371

  return {
    statusCode: 200,
    body: "",
  };
};

const wrappedJoinUser = middy(joinUser)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
const wrappedGetLocation = middy(getLocation)
  .use(authorizeToken())
  .use(doNotWaitForEmptyEventLoop());
export { wrappedJoinUser as joinUser };
export { wrappedGetLocation as getLocation };
