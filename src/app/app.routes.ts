import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'offline',
    canActivate: [authGuard],
    loadComponent: () => import('./features/offline/offline.component').then(m => m.OfflineComponent),
  },
  {
    path: 'instructions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/instructions/instructions.component').then(m => m.InstructionsComponent),
  },
  { path: '**', redirectTo: '' }
];
