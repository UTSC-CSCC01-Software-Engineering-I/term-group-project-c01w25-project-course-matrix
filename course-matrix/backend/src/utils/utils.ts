/**
 * Class representing an API error.
 * Extends the built-in Error class to include a status code and operational flag.
 */
class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  /**
   * Create an ApiError.
   * @param {number} statusCode - The HTTP status code.
   * @param {string} message - The error message.
   * @param {boolean} [isOperational=true] - Whether the error is operational.
   * @param {string} [stack=""] - The stack trace.
   */
  constructor(
    statusCode: number,
    message: string | undefined,
    isOperational = true,
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
