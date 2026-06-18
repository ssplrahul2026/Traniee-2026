import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ShareServices } from '../../shared/services/share-services';

export const roleGuard: CanActivateFn = (route) => {
  const shareService = inject(ShareServices);
  const router = inject(Router);


  const requiredRole = route.data?.['role'];
  const requiredRole2 = route.data?.['role2'];

  if (shareService.userDetails()?.role === requiredRole || shareService.userDetails()?.role === requiredRole2) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('accessToken');

  if (token) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};