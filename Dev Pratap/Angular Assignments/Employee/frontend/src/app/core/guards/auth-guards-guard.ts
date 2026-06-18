import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ShareServices } from '../../shared/services/share-services';

export const authGuardsGuard: CanActivateFn = () => {
  const router = inject(Router)
  const shareService = inject(ShareServices)
  const token = localStorage.getItem("accessToken")

  if(token) return true
  
  localStorage.clear()
  router.navigate(["/auth/login"])
  return false;
};
