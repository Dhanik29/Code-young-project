import { ApiError } from '../utils/apiError.js';

/**
 * Middleware factory for validating incoming requests with Zod schemas.
 * @param {import('zod').ZodSchema} schema 
 * @param {'body'|'query'|'params'} source 
 */
export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(
          ApiError.badRequest('Validation failed for one or more fields', formattedErrors)
        );
      }
      return next(ApiError.badRequest(error.message));
    }
  };
};
