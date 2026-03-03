import { Injectable, computed, signal } from '@angular/core';
import type { Analytics } from 'firebase/analytics';
import { environment } from '../../environments/environment';

type ConsentState = 'pending' | 'accepted' | 'rejected';

const KEY = 'ei.cookies.analytics';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private _state = signal<ConsentState>('pending');
  private analyticsStarted = false;
  private analyticsInstance: Analytics | null = null;
  private appOpenSent = false;

  readonly state = computed(() => this._state());
  readonly shouldShowBanner = computed(() => this._state() === 'pending');

  constructor() {
    const saved = localStorage.getItem(KEY);
    if (saved === 'accepted' || saved === 'rejected') {
      this._state.set(saved);
      if (saved === 'accepted') {
        void this.startAnalytics();
      }
    }
  }

  acceptAnalytics() {
    this._state.set('accepted');
    localStorage.setItem(KEY, 'accepted');
    console.info('[analytics] consent accepted');
    void this.startAnalytics();
  }

  rejectAnalytics() {
    this._state.set('rejected');
    localStorage.setItem(KEY, 'rejected');
    console.info('[analytics] consent rejected');
  }

  async logEvent(name: string, params: Record<string, string | number | boolean> = {}) {
    const analytics = await this.startAnalytics();
    if (!analytics) {
      console.warn(`[analytics] skipped event "${name}" (analytics not available)`);
      return;
    }

    const { logEvent } = await import('firebase/analytics');
    logEvent(analytics, name, params);
    console.info('[analytics] event sent', name, params);
  }

  private async startAnalytics(): Promise<Analytics | null> {
    if (this._state() !== 'accepted') return null;
    if (this.analyticsInstance) return this.analyticsInstance;
    if (this.analyticsStarted) return this.analyticsInstance;

    try {
      const { getApp, getApps, initializeApp } = await import('firebase/app');
      const { isSupported, initializeAnalytics, logEvent } = await import('firebase/analytics');
      if (!(await isSupported())) {
        console.warn('[analytics] not supported in this browser/context');
        return null;
      }
      const app = getApps().length ? getApp() : initializeApp(environment.firebase);
      this.analyticsInstance = initializeAnalytics(app, {
        config: {
          allow_ad_personalization_signals: false,
        },
      });
      this.analyticsStarted = true;
      console.info('[analytics] initialized');
      if (!this.appOpenSent) {
        logEvent(this.analyticsInstance, 'app_open', { mode: 'offline' });
        console.info('[analytics] event sent', 'app_open', { mode: 'offline' });
        this.appOpenSent = true;
      }
      return this.analyticsInstance;
    } catch (err) {
      console.error('[analytics] initialization failed', err);
      return null;
    }
  }
}
