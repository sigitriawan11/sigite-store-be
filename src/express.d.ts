import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    jwt_payload?: any; 
    jwt_token?: string;
  }
}