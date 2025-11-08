import { ServComponent } from './serv/serv.component';
import { ServicesByCategoryComponent } from './services-by-category/services-by-category.component';
import { BecomeProviderComponent } from './become-provider/become-provider.component';
import { authGuard } from './auth.guard';
import { LogINComponent } from './log-in/log-in.component';
import { SingupComponent } from './singup/singup.component';
import { ProvideComponent } from './provide/provide.component';
import { AccountComponent } from './account/account.component';
import { BookedComponent } from './booked/booked.component';
import { ServicesComponent } from './services/services.component';
import { HomeComponent } from './home/home.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },

  {
    path: 'Home',
    component: HomeComponent,
    title: 'Home',
    data: { animation: 'HomePage' }
  },
  {
    path: 'Services',
    component: ServicesComponent,
    title: 'Services',
    data: { animation: 'Services' }
  },
  {
    path: 'Services/:category',
    component: ServicesByCategoryComponent,
    title: ':category',
    data: { animation: 'ServicesDetail' }
  },
  {
    path: 'Services/:category/:id/:service',
    canActivate: [authGuard], 
    component: ServComponent,
    title: ':serivce',
    data: { animation: 'ServicesDetail' }
  },
  {
    path: 'Booked',
    component: BookedComponent,
    canActivate: [authGuard], 
    title: 'Booked',
    data: { animation: 'Booked' }
  },
  {
    path: 'MyAccount',
    canActivate: [authGuard], // allows all authenticated users
    loadComponent: () =>
      import('./account/account.component').then((m) => m.AccountComponent),
    title: 'My Account',
    data: { animation: 'MyAccount' }
  },
  {
    path: 'Provide',
    canActivate: [authGuard], 
    loadComponent: () =>
      import('./provide/provide.component').then((m) => m.ProvideComponent),
      data: { animation: 'Provide' }
    },
{
path:'signup',
component:SingupComponent,
title:'sign up',
data:{animation:'Singup'}
},
{
  path:'login',
  component:LogINComponent,
  title:'LOG IN',
  data:{animation:'LogIN'}
},
{
  path:'BecomeProvider',
  component:BecomeProviderComponent,
  title:'Join Bookme Providers',
  data:{animation:'BecomeProvider'}
}
];
