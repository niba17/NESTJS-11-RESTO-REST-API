import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface IValidationError {
  field: string;
  errors: string[];
}

interface IExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  errors?: IValidationError[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as
      | string
      | IExceptionResponse;

    const originalMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message || exception.message;

    const rawMessage = Array.isArray(originalMessage)
      ? originalMessage[0]
      : originalMessage;

    // --- PERBAIKAN DI SINI, BOS ---
    // Kita paksa status atau enum menjadi number agar ESLint tidak komplain
    let topLevelMessage = rawMessage;
    if (status === (HttpStatus.BAD_REQUEST as number)) {
      topLevelMessage = 'Validation failed';
    }
    // ------------------------------

    const errorName =
      typeof exceptionResponse === 'string'
        ? 'Bad Request'
        : exceptionResponse.error || 'Bad Request';

    const isImageError =
      rawMessage.toLowerCase().includes('file') ||
      rawMessage.toLowerCase().includes('image') ||
      rawMessage.toLowerCase().includes('jpg') ||
      rawMessage.toLowerCase().includes('png');

    const validationErrors =
      typeof exceptionResponse === 'object' && exceptionResponse.errors
        ? exceptionResponse.errors
        : [
            {
              field: isImageError ? 'image' : 'system',
              errors: [rawMessage],
            },
          ];

    response.status(status).json({
      statusCode: status,
      message: topLevelMessage,
      error: errorName,
      errors: validationErrors,
    });
  }
}
