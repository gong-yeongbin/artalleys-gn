import * as crypto from "crypto";

export const name = (n: number) => {
  return crypto.randomBytes(n).toString("hex");
};
