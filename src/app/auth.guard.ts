import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userJson = localStorage.getItem('user');

  if (!userJson) {
    // 🧠 حفظ الرابط المطلوب الوصول إليه
    localStorage.setItem('redirectAfterLogin', state.url);
    return router.createUrlTree(['/login']);
  }

  return true;
};