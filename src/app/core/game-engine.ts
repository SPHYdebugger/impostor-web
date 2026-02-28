import { randInt, shuffle } from './random';

export type Player = {
  id: string;
  alias: string;
};

export type RoundRoles = {
  commonWord: string;
  impostorPlayerId: string;
  // En offline, al impostor se le muestra "IMPOSTOR" (sin la palabra)
};

export type RoundState = {
  roundNumber: number;
  players: Player[];
  roles: RoundRoles;
  speakingOrder: string[]; // array de playerId
  // streak solo cuenta victorias consecutivas del MISMO impostor
  impostorStreak: number;
  previousImpostorId: string | null;
};

export type RoundResult = 'GROUP_CAUGHT_IMPOSTOR' | 'IMPOSTOR_SURVIVED';

export class GameEngine {
  static pickImpostor(players: Player[], previousImpostorId: string | null, previousStreak: number, lastResult: RoundResult | null): { impostorId: string; streak: number } {
    // Regla:
    // - Si el impostor sobrevive, mantiene impostor y suma racha.
    // - Si lo descubren antes de llegar a 2 seguidas, en la siguiente ronda se elige otro al azar.
    const previousStillPresent = !!previousImpostorId && players.some(p => p.id === previousImpostorId);

    if (!previousImpostorId || !lastResult || !previousStillPresent) {
      const id = players[randInt(0, players.length)].id;
      return { impostorId: id, streak: 0 };
    }

    if (lastResult === 'IMPOSTOR_SURVIVED') {
      return { impostorId: previousImpostorId, streak: previousStreak + 1 };
    }

    // GROUP_CAUGHT_IMPOSTOR
    // elegir otro impostor distinto
    const candidates = players.filter(p => p.id !== previousImpostorId);
    const id = candidates[randInt(0, candidates.length)].id;
    return { impostorId: id, streak: 0 };
  }

  static speakingOrder(players: Player[], impostorId: string): string[] {
    // Orden aleatorio, pero NUNCA empieza el impostor
    if (players.length <= 1) return players.map(p => p.id);

    const ids = shuffle(players.map(p => p.id));
    if (ids[0] !== impostorId) return ids;

    // si el impostor quedó primero, intercambiar con el primer no-impostor
    const idx = ids.findIndex(id => id !== impostorId);
    if (idx > 0) {
      [ids[0], ids[idx]] = [ids[idx], ids[0]];
    }
    return ids;
  }

  static nextRound(params: {
    players: Player[];
    commonWord: string;
    previous: RoundState | null;
    lastResult: RoundResult | null;
  }): RoundState {
    const prev = params.previous;
    const { impostorId, streak } = this.pickImpostor(
      params.players,
      prev?.roles.impostorPlayerId ?? null,
      prev?.impostorStreak ?? 0,
      params.lastResult
    );

    const roles: RoundRoles = {
      commonWord: params.commonWord,
      impostorPlayerId: impostorId,
    };

    return {
      roundNumber: (prev?.roundNumber ?? 0) + 1,
      players: params.players,
      roles,
      speakingOrder: this.speakingOrder(params.players, impostorId),
      impostorStreak: streak,
      previousImpostorId: prev?.roles.impostorPlayerId ?? null,
    };
  }
}
