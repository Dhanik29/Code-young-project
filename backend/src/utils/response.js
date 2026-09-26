export const sendSuccess = (res, data, statusCode = 200, message = null) => {
  const payload = {
    success: true,
    data,
  };
  if (message) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
};

export const sendError = (res, error, statusCode = 500) => {
  const payload = {
    success: false,
    error: {
      message: typeof error === 'string' ? error : error.message || 'An unexpected error occurred',
      ...(error.errors && error.errors.length > 0 ? { details: error.errors } : {}),
    },
  };
  return res.status(statusCode).json(payload);
};
