import { ApiError } from '../utils/apiError.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle recognized ApiError
  if (err instanceof ApiError) {
    return sendError(res, err, err.statusCode);
  }

  // Handle Prisma Known Request Errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return sendError(
        res,
        { message: 'A unique constraint was violated on the database.' },
        409
      );
    }
    return sendError(
      res,
      { message: 'A database operation failed.' },
      500
    );
  }

  // Handle generic unhandled errors (never expose internal stack trace in production)
  console.error('Unhandled Application Error:', err);

  const message = err.message || 'An internal server error occurred. Please contact support.';

  return sendError(res, { message }, 500);
};
