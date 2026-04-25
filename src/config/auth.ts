import { ErrBadRequest } from "../config/errors";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types/auth-types";

export class Auth {

  static createToken(payload: JWTPayload, expired?: any) {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: expired ?? "1d",
    });

    return token
  }

  static async validate(access_token: string, withRefreshToken: boolean = false) : Promise<JWTPayload> {
    function verifyJwtToken(token: string, secret: string) {
      return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        });
      });
    }

    let isVerify = await verifyJwtToken(
      access_token,
      process.env.JWT_SECRET ?? ""
    )
      .then(() => true)
      .catch(() => false);

    if (withRefreshToken) {
      if (!isVerify) {
        isVerify = await verifyJwtToken(
          access_token,
          process.env.JWT_SECRET ?? ""
        )
          .then(() => true)
          .catch(() => false);
      }

      if (!isVerify) {
        throw new ErrBadRequest(`JWT Token Invalid`);
      }
    }

    const decoded = jwt.decode(access_token);
    if (!decoded) {
      throw new ErrBadRequest(`Invalid Payload`);
    }

    return decoded as JWTPayload;
  }
}
