import * as crypto from "crypto";
import * as mime from "mime";
import * as admin from "firebase-admin";
import { min } from "moment";
import { bool } from "aws-sdk/clients/signer";

export const generateRandomBase64 = (): string => {
  return crypto.randomBytes(20).toString("base64");
};

export const generateRandomHex = (): string => {
  const unique: string = crypto.randomBytes(20).toString("hex");
  return unique;
};

export const filepath = (filename: string, type: string): string => {
  const uniqueId: string = generateRandomHex();
  const contentType: string = mime.getType(filename);
  const extenstion: string = mime.getExtension(contentType);
  const keyFileName: string = `${uniqueId}.${extenstion}`;
  const path = [type, keyFileName].join("/");
  return path;
};

export const getUid = async (token: string) => {
  let response: any = "";
  await admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      response = {
        uid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number,
      };
    })
    .catch((error) => {
      response = null;
    });

  return response;
};

export const sendPush = async (
  message: admin.messaging.Message
): Promise<boolean> => {
  let result: boolean;
  await admin
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
      result = true;
    })
    .catch((error) => {
      console.log("Error sending message:", error);
      result = false;
    });
  return result;
};
