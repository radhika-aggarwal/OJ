class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode || 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
