import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OfflineStateService } from '../offline/offline-state.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid">
      <div class="card">
        <h2 style="margin:0 0 6px 0">Menú</h2>
        <div class="muted">Elige cómo quieres jugar.</div>
        <hr>

        <div class="grid two">
          <button class="btn primary" (click)="goOffline()">🎮 Jugar offline</button>
          <button class="btn" disabled title="Disponible más adelante">🌐 Jugar online (próximamente)</button>
          <button class="btn" (click)="goInstructions()">📘 Instrucciones</button>
          <button class="btn danger" (click)="reset()">🗑️ Borrar partida offline</button>
        </div>

        <div class="muted" style="margin-top:12px;font-size:12px">
          Online llegará en una versión futura con backend + BD.
        </div>
      </div>

      <div class="card">
        <h3 style="margin:0 0 6px 0">Cómo va el offline</h3>
        <ul class="muted" style="margin:0; padding-left:18px">
          <li>Creas jugadores (alias).</li>
          <li>Se asigna 1 impostor por ronda.</li>
          <li>Reparto de roles en el mismo móvil/PC, uno por uno (modal).</li>
          <li>Orden de turno aleatorio.</li>
          <li>Si el impostor sobrevive 2 rondas seguidas: <b>gana</b>.</li>
        </ul>
      </div>
    </div>
  `,
})
export class HomeComponent {
  private router = inject(Router);
  private offline = inject(OfflineStateService);

  goOffline() {
    this.router.navigateByUrl('/offline');
  }

  goInstructions() {
    this.router.navigateByUrl('/instructions');
  }

  reset() {
    this.offline.resetAll();
    alert('Partida offline borrada.');
  }
}
