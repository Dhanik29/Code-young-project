export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, errors = []) {
    return new ApiError(400, msg, true, errors);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Conflict occurred') {
    return new ApiError(409, msg);
  }

  static tooManyRequests(msg = 'Too many requests, please try again later.') {
    return new ApiError(429, msg);
  }

  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg, false);
  }
}
