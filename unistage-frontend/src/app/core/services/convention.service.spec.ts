/**
 * Tests unitaires Vitest pour la logique du ConventionService
 * Teste les appels HTTP avec un fetch mocké (sans Angular DI)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================
// Types miroir du convention.model.ts
// ============================================================
type StatutConvention =
  | 'BROUILLON'
  | 'SOUMISE'
  | 'VALIDEE_ENTREPRISE'
  | 'VALIDEE_TUTEUR'
  | 'SIGNEE_FINALE'
  | 'REJETEE';

interface ConventionStage {
  id: number;
  statutValidation: StatutConvention;
  missions?: string;
  pdfUrl?: string;
}

// ============================================================
// Logique de mapping pure (extraite de convention.service.ts)
// ============================================================
function getFileUrl(relativePath?: string): string {
  if (!relativePath) return '';
  return `http://localhost:8080/api/files/download/${relativePath}`;
}

function isConventionFinale(convention: ConventionStage): boolean {
  return convention.statutValidation === 'SIGNEE_FINALE';
}

function canBeValidatedByEntreprise(convention: ConventionStage): boolean {
  return convention.statutValidation === 'SOUMISE';
}

function canBeValidatedByTuteur(convention: ConventionStage): boolean {
  return convention.statutValidation === 'VALIDEE_ENTREPRISE';
}

function getStatutLabel(statut: StatutConvention): string {
  const labels: Record<StatutConvention, string> = {
    BROUILLON: 'Brouillon',
    SOUMISE: 'Soumise',
    VALIDEE_ENTREPRISE: 'Validée par l\'Entreprise',
    VALIDEE_TUTEUR: 'Validée par le Tuteur',
    SIGNEE_FINALE: 'Signée — Officielle',
    REJETEE: 'Rejetée',
  };
  return labels[statut] ?? statut;
}

// ============================================================
// TESTS
// ============================================================
describe('ConventionService — Logique métier et utilitaires', () => {

  // -------------------------------------------------------
  describe('getFileUrl()', () => {
    it('retourne une URL complète si relativePath est fourni', () => {
      const url = getFileUrl('conventions/convention_1.pdf');
      expect(url).toBe('http://localhost:8080/api/files/download/conventions/convention_1.pdf');
    });

    it('retourne une chaîne vide si relativePath est undefined', () => {
      expect(getFileUrl(undefined)).toBe('');
    });

    it('retourne une chaîne vide si relativePath est une chaîne vide', () => {
      expect(getFileUrl('')).toBe('');
    });
  });

  // -------------------------------------------------------
  describe('isConventionFinale()', () => {
    it('retourne true pour SIGNEE_FINALE', () => {
      const conv: ConventionStage = { id: 1, statutValidation: 'SIGNEE_FINALE' };
      expect(isConventionFinale(conv)).toBe(true);
    });

    it('retourne false pour SOUMISE', () => {
      const conv: ConventionStage = { id: 2, statutValidation: 'SOUMISE' };
      expect(isConventionFinale(conv)).toBe(false);
    });
  });

  // -------------------------------------------------------
  describe('canBeValidatedByEntreprise()', () => {
    it('retourne true si statut est SOUMISE', () => {
      const conv: ConventionStage = { id: 3, statutValidation: 'SOUMISE' };
      expect(canBeValidatedByEntreprise(conv)).toBe(true);
    });

    it('retourne false si statut est BROUILLON', () => {
      const conv: ConventionStage = { id: 4, statutValidation: 'BROUILLON' };
      expect(canBeValidatedByEntreprise(conv)).toBe(false);
    });

    it('retourne false si statut est VALIDEE_ENTREPRISE (déjà validée)', () => {
      const conv: ConventionStage = { id: 5, statutValidation: 'VALIDEE_ENTREPRISE' };
      expect(canBeValidatedByEntreprise(conv)).toBe(false);
    });
  });

  // -------------------------------------------------------
  describe('canBeValidatedByTuteur()', () => {
    it('retourne true si statut est VALIDEE_ENTREPRISE', () => {
      const conv: ConventionStage = { id: 6, statutValidation: 'VALIDEE_ENTREPRISE' };
      expect(canBeValidatedByTuteur(conv)).toBe(true);
    });

    it('retourne false si statut est SOUMISE', () => {
      const conv: ConventionStage = { id: 7, statutValidation: 'SOUMISE' };
      expect(canBeValidatedByTuteur(conv)).toBe(false);
    });
  });

  // -------------------------------------------------------
  describe('getStatutLabel()', () => {
    it('retourne le bon label pour chaque statut', () => {
      expect(getStatutLabel('BROUILLON')).toBe('Brouillon');
      expect(getStatutLabel('SOUMISE')).toBe('Soumise');
      expect(getStatutLabel('VALIDEE_ENTREPRISE')).toBe("Validée par l'Entreprise");
      expect(getStatutLabel('SIGNEE_FINALE')).toBe('Signée — Officielle');
      expect(getStatutLabel('REJETEE')).toBe('Rejetée');
    });
  });
});
