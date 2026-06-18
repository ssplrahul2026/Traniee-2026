import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { ShareServices } from '../../shared/services/share-services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  // Mechanism to prevent multiple concurrent refresh token API calls
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private router: Router,
    private shareServices: ShareServices
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    
    // Bypass interceptor for login/refresh endpoints to avoid infinite loops
    if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
      return next.handle(req);
    }

    const token = localStorage.getItem('accessToken');

    if (token) {
      // 1. PRE-EMPTIVE CHECK: Is the token already expired or about to expire?
      if (this.isTokenExpired(token)) {
        return this.handleTokenRefresh(req, next);
      }

      // If token is valid, inject it and proceed
      req = this.injectToken(req, token);
    }

    // 2. FALLBACK CHECK: Catch 401s just in case client-server clocks mismatch
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handleTokenRefresh(req, next);
        }
        if (error.status === 500) {
          console.error('Internal Server Error');
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Helper to decode JWT payload and check if 'exp' timestamp has passed
   */
  private isTokenExpired(token: string): boolean {
    try {
      const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
      // Add a 10-second buffer time to catch tokens that expire *during* flight
      return (Math.floor(Date.now() / 1000)) >= (expiry - 10);
    } catch (e) {
      // If token is malformed, treat it as expired
      return true;
    }
  }

  /**
   * Clones the request and appends the Bearer token
   */
  private injectToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Handles the refreshing logic seamlessly supporting concurrent requests
   */
  private handleTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.shareServices.getNewAccessToken(refreshToken).pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          
          this.shareServices.assignUser(res.accessToken);
          this.refreshTokenSubject.next(res.accessToken);

          return next.handle(this.injectToken(req, res.accessToken));
        }),
        catchError((refreshError) => {
          this.isRefreshing = false;
          this.logout();
          return throwError(() => refreshError);
        })
      );
    } else {
      // If a refresh is already happening, queue this request until it finishes
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next.handle(this.injectToken(req, token!)))
      );
    }
  }

  private logout(): void {
    localStorage.clear();
    this.shareServices.userDetails.set(null);
    this.router.navigate(['auth/login']);
  }
}