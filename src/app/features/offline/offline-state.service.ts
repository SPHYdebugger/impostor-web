import { Injectable, signal } from '@angular/core';
import { StorageService } from '../../core/storage.service';
import { GameEngine, Player, RoundResult, RoundState } from '../../core/game-engine';
import { shuffle } from '../../core/random';

export type OfflinePhase =
  | 'SETUP'
  | 'ROLE_REVEAL'
  | 'READY_TO_START'
  | 'PLAY'
  | 'RESULT'
  | 'SURVIVED_NOTICE'
  | 'CAUGHT_NOTICE'
  | 'FINISHED';

export type OfflineGame = {
  phase: OfflinePhase;
  players: Player[];
  // palabra actual elegida para la ronda (todos comparten)
  commonWord: string;
  // estado de ronda actual
  round: RoundState | null;
  lastResult: RoundResult | null;
  // reparto de roles en el mismo dispositivo
  revealOrder: string[]; // array de playerId en orden aleatorio
  revealIndex: number; // índice del jugador que toca ver
  revealOpen: boolean;
};

const KEY = 'ei.offline.game';

@Injectable({ providedIn: 'root' })
export class OfflineStateService {
  private _game = signal<OfflineGame>(this.defaultGame());

  constructor(private storage: StorageService) {
    const saved = this.storage.get<OfflineGame>(KEY);
    if (saved) this._game.set(saved);
  }

  game() {
    return this._game();
  }

  private save(next: OfflineGame) {
    this._game.set(next);
    this.storage.set(KEY, next);
  }

  resetAll() {
    this.save(this.defaultGame());
  }

  startSetup() {
    // Volver a la preparación sin perder jugadores ni el historial de rondas.
    const g = this.game();
    this.save({
      ...g,
      phase: 'SETUP',
      commonWord: '',
      revealOrder: [],
      revealIndex: 0,
      revealOpen: false,
    });
  }

  createPlayers(aliases: string[]) {
    const g = this.game();
    const players: Player[] = aliases.map((a, idx) => ({
      // Mantener ids entre rondas para que la lógica de racha/impostor sea consistente.
      id: g.players[idx]?.id ?? (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${idx}-${Math.random()}`),
      alias: a.trim(),
    }));

    this.save({ ...g, players });
  }

  setCommonWord(word: string) {
    const g = this.game();
    this.save({ ...g, commonWord: word.trim() });
  }

  beginRound() {
    const g = this.game();
    if (g.players.length < 3) throw new Error('Mínimo 3 jugadores');
    if (!g.commonWord) throw new Error('Falta palabra');

    const round = GameEngine.nextRound({
      players: g.players,
      commonWord: g.commonWord,
      previous: g.round,
      lastResult: g.lastResult,
    });

    const revealOrder = this.buildRevealOrder(round.players);

    this.save({
      ...g,
      phase: 'ROLE_REVEAL',
      round,
      revealOrder,
      revealIndex: 0,
      revealOpen: false,
    });
  }

  toggleReveal() {
    const g = this.game();
    if (g.phase !== 'ROLE_REVEAL') return;
    this.save({ ...g, revealOpen: !g.revealOpen });
  }

  nextReveal() {
    const g = this.game();
    if (g.phase !== 'ROLE_REVEAL') return;

    const nextIdx = g.revealIndex + 1;
    if (nextIdx >= g.revealOrder.length) {
      this.save({ ...g, phase: 'READY_TO_START', revealOpen: false });
      return;
    }

    this.save({ ...g, revealIndex: nextIdx, revealOpen: false });
  }

  startPlay() {
    const g = this.game();
    if (g.phase !== 'READY_TO_START') return;
    this.save({ ...g, phase: 'PLAY' });
  }

  finishPlay() {
    const g = this.game();
    if (g.phase !== 'PLAY') return;
    this.save({ ...g, phase: 'RESULT' });
  }

  setResult(result: RoundResult) {
    const g = this.game();
    if (!g.round) return;

    // Comprobar si el impostor gana 2 seguidas
    // Nota: el streak se calcula al arrancar la siguiente ronda. Aquí marcamos lastResult.
    const prevStreak = g.round.impostorStreak;

    let phase: OfflinePhase = 'RESULT';
    if (result === 'IMPOSTOR_SURVIVED' && prevStreak + 1 >= 2) {
      phase = 'FINISHED';
    } else if (result === 'IMPOSTOR_SURVIVED') {
      phase = 'SURVIVED_NOTICE';
    } else {
      phase = 'CAUGHT_NOTICE';
    }

    this.save({ ...g, lastResult: result, phase });
  }

  beginNextRound() {
    // Arranca una nueva ronda con la configuración actual (jugadores + palabra actual).
    this.beginRound();
  }

  private buildRevealOrder(players: Player[]): string[] {
    // Orden realmente aleatorio para el reparto de roles.
    return shuffle(players.map(p => p.id));
  }

  playAgainSamePlayers(newCommonWord: string) {
    const g = this.game();
    this.save({
      ...g,
      commonWord: newCommonWord.trim(),
      phase: 'SETUP',
    });
  }

  prepareNewGameSamePlayers(newCommonWord: string) {
    const g = this.game();
    this.save({
      ...g,
      commonWord: newCommonWord.trim(),
      round: null,
      lastResult: null,
      phase: 'SETUP',
      revealOrder: [],
      revealIndex: 0,
      revealOpen: false,
    });
  }

  private defaultGame(): OfflineGame {
    return {
      phase: 'SETUP',
      players: [],
      commonWord: '',
      round: null,
      lastResult: null,
      revealOrder: [],
      revealIndex: 0,
      revealOpen: false,
    };
  }
}
