import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class ResponseHeaderInterceptor<T> implements NestInterceptor<T, T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const start = Date.now();
    const ctx = context.switchToHttp();
    const req: Request = ctx.getRequest<Request>();
    const res: Response = ctx.getResponse<Response>();

    const handlerName = context.getHandler().name;
    const controllerName = context.getClass().name;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - start;

        res.setHeader('X-Response-Url', req.originalUrl);
        res.setHeader('X-Response-Timestamp', new Date().toISOString());
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        res.setHeader('X-Response-Method', req.method);
        res.setHeader('X-Response-Handler', handlerName);
        res.setHeader('X-Response-Controller', controllerName);
      }),
    );
  }
}
