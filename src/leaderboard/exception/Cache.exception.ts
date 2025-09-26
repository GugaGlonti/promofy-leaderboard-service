import { HttpException, HttpStatus } from '@nestjs/common';

export class CacheException extends HttpException {
  constructor(message: string = 'Cache error', cause?: any) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'CacheException',
        message,
        details: cause
          ? typeof cause === 'object' && cause !== null && 'message' in cause
            ? (cause as { message?: string }).message
            : String(cause)
          : undefined,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
