import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfflineStateService } from './offline-state.service';
import { WordsService, WordItem } from '../../core/words.service';
import { Player, RoundResult } from '../../core/game-engine';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid">
      <div class="card">
        <div class="row">
          <div>
            <h2 style="margin:0 0 6px 0">Modo offline</h2>
            <div class="muted">Todo ocurre en un solo dispositivo.</div>
          </div>
          <div class="row" style="gap:8px">
            <span class="badge">Ronda: <b>#{{ roundNumber() }}</b></span>
            <span class="badge" *ngIf="impostorStreak() > 0">Racha impostor: <b>{{ impostorStreak() }}</b>/2</span>
            <button class="btn small" (click)="goHome()">Volver</button>
          </div>
        </div>
      </div>

      <!-- SETUP -->
      <div class="card" *ngIf="phase() === 'SETUP'">
        <h3 style="margin:0 0 6px 0">1) Preparación</h3>
        <div class="muted">Crea jugadores y define la palabra común.</div>
        <hr>

        <div class="grid two">
          <div class="card" style="padding:14px">
            <h4 style="margin:0 0 10px 0">Jugadores</h4>

            <label>Número de jugadores (mínimo 3)</label>
            <input class="input" type="number" [(ngModel)]="playerCount" min="3" max="20" (ngModelChange)="syncAliases()" />

            <div style="height:10px"></div>

            <div class="grid" style="gap:8px">
              <div *ngFor="let a of aliases(); let i = index">
                <label>Alias jugador {{ i + 1 }}</label>
                <input class="input" [(ngModel)]="aliases()[i]" (ngModelChange)="onAliasChange(i, $event)" placeholder="Ej: Jugador {{ i + 1 }}" />
              </div>
            </div>
          </div>

          <div class="card" style="padding:14px">
            <h4 style="margin:0 0 10px 0">Palabra</h4>

            <label>Elige de la lista</label>
            <select class="input" [(ngModel)]="selectedWord">
              <option value="">— Selecciona —</option>
              <option *ngFor="let w of words()" [value]="w.word">{{ w.word }} ({{ w.category }})</option>
            </select>

            <div class="row" style="margin-top:10px">
              <button class="btn" (click)="pickRandomWord()" [disabled]="words().length === 0">🎲 Aleatoria</button>
              <span class="muted" style="font-size:12px">o escribe una</span>
            </div>

            <div style="height:10px"></div>

            <label>Palabra personalizada</label>
            <input class="input" [(ngModel)]="customWord" placeholder="Ej: Playa" />

            <div class="muted" style="margin-top:10px;font-size:12px">
              * El impostor verá <b>IMPOSTOR</b> en lugar de la palabra.
            </div>
          </div>
        </div>

        <div class="row" style="margin-top:14px">
          <button class="btn primary" (click)="startRound()" [disabled]="!canStartRound()">Repartir roles</button>
          <span class="muted" style="font-size:12px">Tip: usa nombres cortos para pasar el móvil más rápido.</span>
        </div>
      </div>

      <!-- ROLE REVEAL -->
      <div class="card" *ngIf="phase() === 'ROLE_REVEAL'">
        <h3 style="margin:0 0 6px 0">2) Reparto de roles</h3>
        <div class="muted">Pasa el dispositivo al jugador indicado para ver su rol.</div>
        <hr>

        <div class="center">
          <div class="muted" style="margin-bottom:10px">Turno de:</div>
          <button class="btn primary" style="font-size:22px;padding:16px 20px" (click)="toggleReveal()">{{ currentRevealPlayer()?.alias }}</button>

          <div class="muted" style="margin-top:12px">Pulsa su nombre para mostrar/ocultar.</div>
        </div>

        <div class="row" style="margin-top:14px">
          <button class="btn" (click)="nextReveal()" [disabled]="revealOpen()">Siguiente</button>
          <span class="muted" style="font-size:12px">(Primero oculta la palabra, luego “Siguiente”)</span>
        </div>
      </div>

      <!-- READY TO START -->
      <div class="card" *ngIf="phase() === 'READY_TO_START'">
        <h3 style="margin:0 0 6px 0">3) Todo listo</h3>
        <div class="muted">Todos ya han visto su rol. Cuando queráis, empezad la ronda.</div>
        <hr>

        <div class="row">
          <button class="btn primary" (click)="startPlay()">Comenzar</button>
        </div>
      </div>

      <!-- PLAY -->
      <div class="card" *ngIf="phase() === 'PLAY'">
        <h3 style="margin:0 0 6px 0">4) Ronda</h3>
        <div class="muted">Orden aleatorio. El impostor nunca empieza.</div>
        <hr>

        <div class="card" style="padding:14px">
          <div class="row">
            <div>
              <div class="muted">Habla ahora:</div>
              <div style="font-size:26px;font-weight:900">{{ currentSpeakerAlias() }}</div>
            </div>
            <div class="row" style="gap:8px">
              <button class="btn" (click)="nextSpeaker()" [disabled]="isLastSpeaker()">Siguiente turno</button>
              <button class="btn primary" (click)="finishPlay()" [disabled]="!isLastSpeaker()">Terminar ronda</button>
            </div>
          </div>
          <div class="muted" style="margin-top:10px">
            {{ speakerIndex()+1 }} / {{ speakingOrderIds().length }}
          </div>
        </div>

        <div class="card" style="padding:14px">
          <div class="row">
            <div><b>Orden completo</b></div>
            <div class="muted" style="font-size:12px">(no revela roles)</div>
          </div>
          <ol class="muted" style="margin:10px 0 0 0">
            <li *ngFor="let pid of speakingOrderIds(); let i = index">
              <span [style.fontWeight]="i === speakerIndex() ? '900' : '400'">
                {{ aliasById(pid) }}
              </span>
            </li>
          </ol>
        </div>
      </div>

      <!-- RESULT -->
      <div class="card" *ngIf="phase() === 'RESULT'">
        <h3 style="margin:0 0 6px 0">5) Resultado</h3>
        <div class="muted">¿El grupo descubrió al impostor o sobrevivió?</div>
        <hr>

        <div class="grid two">
          <button class="btn" (click)="setResult('GROUP_CAUGHT_IMPOSTOR')">🕵️‍♂️ Descubierto (gana el grupo)</button>
          <button class="btn primary" (click)="setResult('IMPOSTOR_SURVIVED')">😈 Sobrevive (gana el impostor)</button>
        </div>

        <div class="muted" style="margin-top:12px;font-size:12px">
          Nota: en la siguiente ronda, si fue descubierto, se elige otro impostor al azar.
          Si sobrevivió, repite como impostor y suma racha.
        </div>

        <div class="row" style="margin-top:14px">
          <button class="btn primary" (click)="newRound()">Volver a jugar</button>
          <button class="btn danger" (click)="resetAll()">Terminar y borrar</button>
        </div>
      </div>

      <!-- FINISHED -->
      <div class="card" *ngIf="phase() === 'FINISHED'">
        <h3 style="margin:0 0 6px 0">🏆 Partida finalizada</h3>
        <div class="muted">El impostor ha sobrevivido 2 rondas seguidas.</div>
        <hr>

        <div class="card" style="padding:14px">
          <div class="muted">Ganador absoluto:</div>
          <div style="font-size:30px;font-weight:950">{{ impostorAlias() }}</div>
        </div>

        <div class="row" style="margin-top:14px">
          <button class="btn primary" (click)="resetAll()">Nueva partida</button>
          <button class="btn" (click)="goHome()">Menú</button>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-backdrop" *ngIf="revealOpen()" (click)="toggleReveal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="row">
            <h2 style="margin:0">{{ currentRevealPlayer()?.alias }}</h2>
            <span class="badge" [class.bad]="isImpostor(currentRevealPlayer())" [class.ok]="!isImpostor(currentRevealPlayer())">
              {{ isImpostor(currentRevealPlayer()) ? 'IMPOSTOR' : 'PALABRA' }}
            </span>
          </div>
          <div class="center" style="margin-top:12px">
            <div class="big-word">{{ revealWord() }}</div>
            <div class="muted" style="margin-top:10px">Pulsa fuera o el botón del nombre para ocultar.</div>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class OfflineComponent implements OnInit {
  private offline = inject(OfflineStateService);
  private wordsService = inject(WordsService);
  private router = inject(Router);

  // UI state
  words = signal<WordItem[]>([]);
  playerCount = 4;
  selectedWord = '';
  customWord = '';
  aliases = signal<string[]>(['', '', '', '']);

  // play UI state
  speakerIndex = signal(0);

  // derived
  game = computed(() => this.offline.game());
  phase = computed(() => this.game().phase);
  revealOpen = computed(() => this.game().revealOpen);

  roundNumber = computed(() => this.game().round?.roundNumber ?? 0);
  impostorStreak = computed(() => this.game().round?.impostorStreak ?? 0);

  speakingOrderIds = computed(() => this.game().round?.speakingOrder ?? []);
  revealOrderIds = computed(() => this.game().revealOrder ?? []);

  ngOnInit(): void {
    this.wordsService.load()
      .then(list => this.words.set(list))
      .catch(() => this.words.set([]));

    // if there's an existing game with players, hydrate setup UI
    const g = this.game();
    if (g.players.length >= 3 && g.phase === 'SETUP') {
      this.playerCount = g.players.length;
      this.aliases.set(g.players.map(p => p.alias));
    }
  }

  goHome() {
    this.router.navigateByUrl('/');
  }

  resetAll() {
    this.offline.resetAll();
    this.playerCount = 4;
    this.aliases.set(['', '', '', '']);
    this.selectedWord = '';
    this.customWord = '';
    this.speakerIndex.set(0);
  }

  syncAliases() {
    const n = Math.max(3, Math.min(20, Number(this.playerCount || 3)));
    this.playerCount = n;
    const current = this.aliases();
    const next = [...current];
    while (next.length < n) next.push('');
    while (next.length > n) next.pop();
    this.aliases.set(next);
  }

  onAliasChange(i: number, v: string) {
    const next = [...this.aliases()];
    next[i] = v;
    this.aliases.set(next);
  }

  pickRandomWord() {
    const list = this.words();
    if (!list.length) return;
    const idx = Math.floor(Math.random() * list.length);
    this.selectedWord = list[idx].word;
  }

  canStartRound(): boolean {
    const aliasesOk = this.aliases().every(a => a.trim().length > 0);
    const w = this.getWord();
    return aliasesOk && w.trim().length > 0;
  }

  private getWord(): string {
    return (this.customWord.trim() || this.selectedWord.trim());
  }

  startRound() {
    const aliases = this.aliases().map(a => a.trim());
    const word = this.getWord();

    this.offline.createPlayers(aliases);
    this.offline.setCommonWord(word);
    this.offline.beginRound();
    this.speakerIndex.set(0);
  }

  currentRevealPlayer(): Player | null {
    const g = this.game();
    if (g.phase !== 'ROLE_REVEAL') return null;
    const playerId = this.revealOrderIds()[g.revealIndex];
    if (!playerId) return g.players[g.revealIndex] ?? null;
    return g.players.find(p => p.id === playerId) ?? null;
  }

  isImpostor(p: Player | null): boolean {
    const g = this.game();
    if (!p || !g.round) return false;
    return g.round.roles.impostorPlayerId === p.id;
  }

  revealWord(): string {
    const g = this.game();
    const p = this.currentRevealPlayer();
    if (!p || !g.round) return '';
    return this.isImpostor(p) ? 'IMPOSTOR' : g.round.roles.commonWord;
  }

  toggleReveal() {
    this.offline.toggleReveal();
  }

  nextReveal() {
    this.offline.nextReveal();
  }

  aliasById(id: string): string {
    const g = this.game();
    return g.players.find(p => p.id === id)?.alias ?? '¿?';
  }

  currentSpeakerAlias(): string {
    const order = this.speakingOrderIds();
    const idx = this.speakerIndex();
    const id = order[idx];
    return id ? this.aliasById(id) : '';
  }

  isLastSpeaker(): boolean {
    const order = this.speakingOrderIds();
    return this.speakerIndex() >= order.length - 1;
  }

  nextSpeaker() {
    if (this.isLastSpeaker()) return;
    this.speakerIndex.set(this.speakerIndex() + 1);
  }

  finishPlay() {
    this.offline.finishPlay();
  }

  startPlay() {
    this.speakerIndex.set(0);
    this.offline.startPlay();
  }

  setResult(r: RoundResult) {
    this.offline.setResult(r);
  }

  impostorAlias(): string {
    const g = this.game();
    const id = g.round?.roles.impostorPlayerId;
    if (!id) return '';
    return this.aliasById(id);
  }

  newRound() {
    // volvemos a setup pero manteniendo jugadores (se mantienen en el estado)
    // Reutilizamos el componente: re-hidratamos aliases y dejamos elegir palabra.
    const g = this.game();
    this.playerCount = Math.max(3, g.players.length || this.playerCount);
    this.aliases.set(g.players.map(p => p.alias));
    this.selectedWord = '';
    this.customWord = '';

    // para iniciar la siguiente ronda, basta con volver a SETUP (mantenemos round/lastResult)
    // lo hacemos reusando el almacenamiento actual:
    this.offline.startSetup();
  }
}
