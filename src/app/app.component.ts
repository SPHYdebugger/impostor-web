import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SessionService } from './core/session.service';
import { CookieConsentService } from './core/cookie-consent.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="container">
      <div class="header">
        <div class="brand" (click)="goHome()" style="cursor:pointer">
          <div class="logo"></div>
          <div class="title">El Impostor</div>
        </div>
        <div class="mode-label">Versión BETA</div>
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

    <div class="cookie-gate" *ngIf="showCookieBanner()">
      <div class="cookie-modal card" role="dialog" aria-modal="true" aria-label="Consentimiento de cookies">
        <div class="cookie-title">Cookies de analítica</div>
        <div class="cookie-text">
          No guardamos datos personales de la partida. Para continuar, acepta o rechaza las cookies de analítica.
        </div>
        <div class="cookie-actions">
          <button class="btn ghost" (click)="rejectCookies()">Rechazar</button>
          <button class="btn primary" (click)="acceptCookies()">Aceptar</button>
        </div>
      </div>
    </div>
  `,
})
export class AppComponent {
  private session = inject(SessionService);
  private router = inject(Router);
  private cookieConsent = inject(CookieConsentService);

  isLoggedIn = computed(() => this.session.isLoggedIn());
  userName = computed(() => this.session.user()?.alias ?? '');
  showCookieBanner = computed(() => this.cookieConsent.shouldShowBanner());

  goHome() {
    if (this.session.isLoggedIn()) this.router.navigateByUrl('/');
    else this.router.navigateByUrl('/auth');
  }

  logout() {
    this.session.logout();
    this.router.navigateByUrl('/auth');
  }

  acceptCookies() {
    this.cookieConsent.acceptAnalytics();
  }

  rejectCookies() {
    this.cookieConsent.rejectAnalytics();
  }
}
