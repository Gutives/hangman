
export interface GameWord {
  word: string;
  hint: string;
}

export enum GameStatus {
  PLAYING = 'playing',
  WON = 'won',
  LOST = 'lost'
}

export interface GameStats {
  totalWins: number;
  totalLosses: number;
  bestTime: number | null; // in seconds
}

export interface SessionResult {
  word: string;
  time: number;
  wrongGuesses: number;
  status: GameStatus;
}

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
