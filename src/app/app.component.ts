import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from './core/session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="container">
      <div class="header">
        <div class="brand" (click)="goHome()" style="cursor:pointer">
          <div class="logo"></div>
          <div>
            <div class="title">El Impostor</div>
            <div class="subtitle">Modo offline (v0)</div>
          </div>
        </div>
        <div class="row header-actions" style="gap:8px">
          <ng-container *ngIf="isLoggedIn()">
            <span class="badge header-user">👤 {{ userName() }}</span>
            <button class="btn small ghost header-logout" (click)="logout()">Salir</button>
          </ng-container>
        </div>
      </div>

      <router-outlet />

      <div class="muted" style="margin-top:16px;font-size:12px">
        Versión v0 en pruebas <span class="kbd">BETA</span>.
      </div>
    </div>
  `,
})
export class AppComponent {
  private session = inject(SessionService);
  private router = inject(Router);

  isLoggedIn = computed(() => this.session.isLoggedIn());
  userName = computed(() => this.session.user()?.alias ?? '');

  goHome() {
    if (this.session.isLoggedIn()) this.router.navigateByUrl('/');
    else this.router.navigateByUrl('/auth');
  }

  logout() {
    this.session.logout();
    this.router.navigateByUrl('/auth');
  }
}
