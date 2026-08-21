// src/test-setup.ts
// Fichier de configuration global pour les tests Vitest

import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';

// Polyfill localStorage pour les tests unitaires
if (typeof globalThis.localStorage === 'undefined') {
  const store: Record<string, string> = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      get length() { return Object.keys(store).length; },
      key: (index: number) => Object.keys(store)[index] ?? null,
    },
    writable: true,
  });
}
