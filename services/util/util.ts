import * as crypto from "crypto";
import * as admin from "firebase-admin";

export const name = (n: number): string => {
  return crypto.randomBytes(n).toString("hex");
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
