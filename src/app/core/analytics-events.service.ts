import { Injectable, inject } from '@angular/core';
import { CookieConsentService } from './cookie-consent.service';

type GameFinishedReason = 'impostor_won' | 'manual_end';

const ANON_ID_KEY = 'ei.analytics.anon_id';
const USER_EVENT_SENT_KEY = 'ei.analytics.usuario_id.sent';

@Injectable({ providedIn: 'root' })
export class AnalyticsEventsService {
  private consent = inject(CookieConsentService);

  trackUsuarioId() {
    if (localStorage.getItem(USER_EVENT_SENT_KEY) === '1') return;
    void this.consent.logEvent('usuario_id', {
      anon_id: this.getAnonId(),
    });
    localStorage.setItem(USER_EVENT_SENT_KEY, '1');
  }

  trackGameCreated(playersCount: number, mode: 'offline' | 'online' = 'offline') {
    void this.consent.logEvent('game_created', {
      anon_id: this.getAnonId(),
      mode,
      players_count: playersCount,
    });
  }

  trackGameFinished(reason: GameFinishedReason, roundsPlayed: number, mode: 'offline' | 'online' = 'offline') {
    void this.consent.logEvent('game_finished', {
      anon_id: this.getAnonId(),
      reason,
      rounds_played: roundsPlayed,
      mode,
    });
  }

  trackImpostorWon(roundNumber: number, streak: number, mode: 'offline' | 'online' = 'offline') {
    void this.consent.logEvent('impostor_won', {
      anon_id: this.getAnonId(),
      round_number: roundNumber,
      streak,
      mode,
    });
  }

  private getAnonId(): string {
    const existing = localStorage.getItem(ANON_ID_KEY);
    if (existing) return existing;

    const value = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    localStorage.setItem(ANON_ID_KEY, value);
    return value;
  }
}
