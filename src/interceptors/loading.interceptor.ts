import { LoadingService } from './../app/loading.service';
import { inject } from '@angular/core';
import { HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<any>> => {
  const loadingService = inject(LoadingService);

  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      setTimeout(() => loadingService.hide(), 200);
    })
  );
  
};
