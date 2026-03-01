import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../core/session.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h2 style="margin:0 0 6px 0">Entrar</h2>
      <div class="muted">Versión offline: no se comparte ningún dato.</div>
      <hr>

      <div class="grid two">
        <div>
          <label>Alias</label>
          <input class="input" [(ngModel)]="alias" placeholder="Ej: Laura" />
        </div>
        <div>
          <label>Email</label>
          <input class="input" [(ngModel)]="email" placeholder="Ej: laura@mail.com" />
        </div>
      </div>

      <div class="row" style="margin-top:14px">
        <button class="btn primary" (click)="enter()" [disabled]="!alias.trim()">Entrar</button>
      </div>
    </div>
  `,
})
export class AuthComponent {
  private session = inject(SessionService);
  private router = inject(Router);

  alias = '';
  email = '';

  enter() {
    this.session.loginOrRegister(this.alias, this.email);
    this.router.navigateByUrl('/');
  }
}
