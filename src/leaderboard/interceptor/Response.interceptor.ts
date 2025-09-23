import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

export interface ResponseMetadata {
  url: string;
  timestamp: string;
  responseTime: string;
  method: string;
  handler: string;
  controller: string;
}

export interface ResponseWithMetadata<T> {
  metadata: ResponseMetadata;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseWithMetadata<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseWithMetadata<T>> {
    const start = Date.now();

    const ctx = context.switchToHttp();
    const req: Request = ctx.getRequest<Request>();

    const handlerName = context.getHandler().name;
    const controllerName = context.getClass().name;

    return next.handle().pipe(
      map((data: T) => {
        const responseTime = Date.now() - start;

        const metadata: ResponseMetadata = {
          url: req.originalUrl,
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
          method: req.method,
          handler: handlerName,
          controller: controllerName,
        };

        return {
          metadata,
          data,
        };
      }),
    );
  }
}
