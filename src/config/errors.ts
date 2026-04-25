import { MSG } from "../config/message";
import { RC } from "../config/rc";

export class BaseError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ResponseError extends BaseError {
  constructor(code: number, message: string) {
    super(message, code)
  }
}

export class ErrNotFound extends BaseError {
  constructor(message = MSG.ERR_NOT_FOUND) {
    super(message, RC.NOT_FOUND);
  }
}

export class ErrBadRequest extends BaseError {
  constructor(message = MSG.ERR_BAD_REQUEST) {
    super(message, RC.BAD_REQUEST);
  }
}

export class ErrUnauthorized extends BaseError {
  constructor(message = MSG.ERR_UNAUTHORIZED) {
    super(message, RC.UNAUTHORIZED);
  }
}

export class ErrForbidden extends BaseError {
  constructor(message = MSG.ERR_FORBIDDEN) {
    super(message, RC.FORBIDDEN);
  }
}
