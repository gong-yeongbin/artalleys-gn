import * as crypto from "crypto";

export const name = (n: number): string => {
  return crypto.randomBytes(n).toString("hex");
};
