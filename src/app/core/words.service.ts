import { Injectable } from '@angular/core';

export type WordItem = { category: string; word: string };

@Injectable({ providedIn: 'root' })
export class WordsService {
  private cache: WordItem[] | null = null;

  async load(): Promise<WordItem[]> {
    if (this.cache) return this.cache;
    const res = await fetch('assets/words.json');
    const data = (await res.json()) as WordItem[];
    this.cache = data;
    return data;
  }
}
