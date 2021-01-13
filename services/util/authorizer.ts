import { getDatabaseConnection } from "../../src/connection/Connection";
import middy from "@middy/core";
import * as admin from "firebase-admin";

const authorizeToken = (): middy.MiddlewareObject<any, any> => {
  return {
    before: async (handler: middy.HandlerLambda, next: middy.NextFunction) => {
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
    },
  };
};

export { authorizeToken };
