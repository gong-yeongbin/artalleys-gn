import { getDatabaseConnection } from "../../src/connection/Connection";
import { PostCategory, User } from "../../src/entity/Entity";
import middy from "@middy/core";
import * as admin from "firebase-admin";

const { PROJECT_ID, PRIVATE_KEY, CLIENT_EMAIL } = process.env;
const authorizeToken = (): middy.MiddlewareObject<any, any> => {
  return {
    before: async (handler: middy.HandlerLambda, next: middy.NextFunction) => {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: PROJECT_ID,
            privateKey: PRIVATE_KEY.replace(/\\n/g, "\n"),
            clientEmail: CLIENT_EMAIL,
          }),
          databaseURL: "",
        });
      }

      let resource: string = handler.event.resource;
      if (
        resource.indexOf("createRoom") != -1 ||
        resource.indexOf("getFeed") != -1 ||
        resource.indexOf("getBusinessFeed") != -1 ||
        resource.indexOf("getPost") != -1 ||
        resource.indexOf("getPostCategory") != -1 ||
        resource.indexOf("getBusinessCategory") != -1 ||
        resource.indexOf("getNotice") != -1
      ) {
        return;
      }

      if (!handler.event || !handler.event.headers["Authorization"]) {
        return new Error("token missing");
      }
      const token: string = handler.event.headers["Authorization"];

      await admin
        .auth()
        .verifyIdToken(token)
        .then((decodedToken) => {
          return;
        })
        .catch((error) => {
          return new Error("token expiration");
        });
    },
  };
};

export { authorizeToken };
