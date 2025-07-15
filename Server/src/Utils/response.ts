import { Response } from 'express';

export const sendSuccessResponse = <T>(
  res: Response,
  message: string,
  statusCode: number,
  data?: T,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendErrorResponse = (res: Response, message: string, statusCode: number) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
