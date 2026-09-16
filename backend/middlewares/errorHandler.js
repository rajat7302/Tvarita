export const errorHandler = (err, req, res, next) => {
  const statusCode = err.code === 'LIMIT_FILE_SIZE'
    ? 413
    : (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.code === 'LIMIT_FILE_SIZE'
    ? 'Uploaded media must be smaller than 50 MB.'
    : err.message || 'Internal Server Error';
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};