import { getDatabaseConnection } from "../../src/connection/Connection";
import { PostCategory, User } from "../../src/entity/Entity";
import middy from "@middy/core";
import * as admin from "firebase-admin";

const authorizeToken = (): middy.MiddlewareObject<any, any> => {
  return {
    before: async (handler: middy.HandlerLambda, next: middy.NextFunction) => {
      const connection = await getDatabaseConnection();
      const userRepository = connection.getRepository(User);
      const serviceAccount = require("../util/artalleys-gn-78385-firebase-adminsdk-9jh66-d8a4bb8e92.json");
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: "",
        });
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
