import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ExtractJwt } from 'passport-jwt';

/**
 * Optional JWT Auth Guard
 * Allows requests with or without authentication
 * If token is provided and valid, user is attached to request
 * If no token or invalid token, request continues without user
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    // If no token, immediately allow request without calling Passport
    if (!token) {
      request.user = null;
      return true;
    }
    
    // If token exists, try to validate it using Passport
    // But catch all errors and allow request to proceed
    try {
      const result = super.canActivate(context);
      
      if (result instanceof Observable) {
        return result.pipe(
          map(() => true), // If successful, allow request
          catchError((error) => {
            // If authentication fails for any reason, set user to null and allow request
            request.user = null;
            return of(true);
          })
        );
      }
      
      if (result instanceof Promise) {
        return result
          .then(() => true)
          .catch((error) => {
            // If authentication fails, set user to null and allow request
            request.user = null;
            return true;
          });
      }
      
      return result;
    } catch (error) {
      // If any synchronous error occurs, set user to null and allow request
      request.user = null;
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    // Never throw errors - always return null if no user
    // This allows the route to work with or without authentication
    if (err || !user) {
      return null;
    }
    return user;
  }
}

