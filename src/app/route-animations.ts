import { trigger, transition, style, animate } from '@angular/animations';

export const slideInAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('400ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);