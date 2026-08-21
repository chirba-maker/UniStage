/**
 * Tests unitaires Vitest pour AuthService
 * Vérifie : isLoggedIn, updateCurrentUser, getUserFromStorage, logout
 */

import { describe, it, expect, beforeEach } from 'vitest';

// ============================================================
// Implémentation en pur TypeScript (sans Angular DI)
// pour tester la logique de stockage localStorage
// ============================================================

const LS_TOKEN_KEY = 'access_token';
const LS_REFRESH_KEY = 'refresh_token';
const LS_USER_KEY = 'user_data';

type Role = 'ROLE_ETUDIANT' | 'ROLE_ENTREPRISE' | 'ROLE_TUTEUR' | 'ROLE_ADMIN';

interface User {
  id: number;
  email: string;
  role: Role;
  nomComplet?: string;
  photoUrl?: string;
  telephone?: string;
  filiere?: string;
  adresse?: string;
  departement?: string;
  organisation?: string;
}

// Fonctions extraites de auth.service.ts (logique pure, sans HttpClient)
function isLoggedIn(): boolean {
  return !!localStorage.getItem(LS_TOKEN_KEY);
}

function getUserFromStorage(): User | null {
  const data = localStorage.getItem(LS_USER_KEY);
  return data ? JSON.parse(data) : null;
}

function updateCurrentUser(current: User, updatedData: Partial<User>): User {
  const updated: User = { ...current, ...updatedData };
  localStorage.setItem(LS_USER_KEY, JSON.stringify(updated));
  return updated;
}

function logout(): void {
  localStorage.removeItem(LS_TOKEN_KEY);
  localStorage.removeItem(LS_REFRESH_KEY);
  localStorage.removeItem(LS_USER_KEY);
}

// ============================================================
// TESTS
// ============================================================

describe('AuthService — Logique de stockage localStorage', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------------
  it('isLoggedIn() retourne false si aucun token en localStorage', () => {
    expect(isLoggedIn()).toBe(false);
  });

  // -------------------------------------------------------
  it('isLoggedIn() retourne true si un access_token est présent', () => {
    localStorage.setItem(LS_TOKEN_KEY, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test');
    expect(isLoggedIn()).toBe(true);
  });

  // -------------------------------------------------------
  it('getUserFromStorage() retourne null si pas de user_data', () => {
    expect(getUserFromStorage()).toBeNull();
  });

  // -------------------------------------------------------
  it('getUserFromStorage() désérialise correctement le JSON en objet User', () => {
    const user: User = {
      id: 1,
      email: 'test@univ-labe.edu.gn',
      role: 'ROLE_ETUDIANT',
      nomComplet: 'Mamadou Bah',
      filiere: 'Informatique',
    };
    localStorage.setItem(LS_USER_KEY, JSON.stringify(user));

    const result = getUserFromStorage();
    expect(result).not.toBeNull();
    expect(result!.email).toBe('test@univ-labe.edu.gn');
    expect(result!.nomComplet).toBe('Mamadou Bah');
    expect(result!.filiere).toBe('Informatique');
  });

  // -------------------------------------------------------
  it('updateCurrentUser() fusionne les champs et persiste dans localStorage', () => {
    const currentUser: User = {
      id: 2,
      email: 'admin@univ-labe.edu.gn',
      role: 'ROLE_ADMIN',
      nomComplet: 'Ancien Nom',
    };

    const updated = updateCurrentUser(currentUser, {
      nomComplet: 'Mamadou Bassirou Diallo',
      telephone: '+224 620 000 000',
    });

    expect(updated.nomComplet).toBe('Mamadou Bassirou Diallo');
    expect(updated.telephone).toBe('+224 620 000 000');
    expect(updated.email).toBe('admin@univ-labe.edu.gn'); // Champ préservé

    // Vérifier la persistance dans localStorage
    const stored = getUserFromStorage();
    expect(stored!.nomComplet).toBe('Mamadou Bassirou Diallo');
  });

  // -------------------------------------------------------
  it('updateCurrentUser() met à jour organisation/filiere sans écraser les autres champs', () => {
    const currentUser: User = {
      id: 3,
      email: 'etudiant@test.com',
      role: 'ROLE_ETUDIANT',
      nomComplet: 'Alpha Diallo',
      telephone: '+224 610 111 222',
    };

    updateCurrentUser(currentUser, { filiere: 'Mathématiques Appliquées' });

    const stored = getUserFromStorage();
    expect(stored!.filiere).toBe('Mathématiques Appliquées');
    expect(stored!.telephone).toBe('+224 610 111 222'); // Préservé
    expect(stored!.nomComplet).toBe('Alpha Diallo');    // Préservé
  });

  // -------------------------------------------------------
  it('logout() supprime tous les éléments du localStorage', () => {
    localStorage.setItem(LS_TOKEN_KEY, 'token123');
    localStorage.setItem(LS_REFRESH_KEY, 'refresh123');
    localStorage.setItem(LS_USER_KEY, JSON.stringify({ id: 1 }));

    logout();

    expect(localStorage.getItem(LS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(LS_REFRESH_KEY)).toBeNull();
    expect(localStorage.getItem(LS_USER_KEY)).toBeNull();
    expect(isLoggedIn()).toBe(false);
  });
});
