import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type LocalUser = {
  alias: string;
  email?: string;
  createdAtIso: string;
};

const KEY = 'ei.session.user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private _user = signal<LocalUser | null>(null);

  constructor(private storage: StorageService) {
    const saved = this.storage.get<LocalUser>(KEY);
    if (saved) this._user.set(saved);
  }

  user() {
    return this._user();
  }

  isLoggedIn(): boolean {
    return !!this._user();
  }

  loginOrRegister(alias: string, email?: string) {
    const user: LocalUser = {
      alias: alias.trim(),
      email: email?.trim() || undefined,
      createdAtIso: new Date().toISOString(),
    };
    this._user.set(user);
    this.storage.set(KEY, user);
  }

  logout() {
    this._user.set(null);
    this.storage.remove(KEY);
  }
}
