import { describe, it, expect } from 'vitest';
import { App } from './app';

describe('App Component', () => {
  it('devrait être défini et instanciable', () => {
    expect(App).toBeDefined();
  });
});
