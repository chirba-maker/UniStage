import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConventionService } from '../../../core/services/convention.service';
import { ConventionStage } from '../../../core/models/convention.model';

@Component({
  selector: 'app-tuteur-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container my-5">
      <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 bg-primary text-white">
        <h2 class="fw-bold mb-1">👨‍🏫 Espace Tuteur Académique</h2>
        <p class="opacity-75 mb-0">Université de Labé — Validation et suivi des conventions de stage de vos étudiants.</p>
      </div>

      <h4 class="fw-bold mb-3">Conventions Assignées à votre Suivi ({{ conventions().length }})</h4>

      <div *ngIf="loading()" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>

      <div *ngIf="!loading() && conventions().length === 0" class="text-center py-5 bg-light rounded-4">
        <h5 class="text-muted">Aucune convention de stage ne vous est attribuée pour le moment.</h5>
      </div>

      <div class="row g-4" *ngIf="!loading() && conventions().length > 0">
        <div class="col-12" *ngFor="let conv of conventions()">
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <div class="row align-items-center">
              <div class="col-md-8">
                <span class="badge bg-primary-subtle text-primary mb-2">Convention N° {{ conv.id }}</span>
                <h4 class="fw-bold mb-1">Etudiant : {{ conv.candidature.etudiant.nom }} {{ conv.candidature.etudiant.prenom }}</h4>
                <h6 class="text-muted mb-2">Filière : {{ conv.candidature.etudiant.filiere }} ({{ conv.candidature.etudiant.niveau }})</h6>
                <p class="mb-1"><strong>Entreprise :</strong> {{ conv.candidature.offre.nomEntreprise }}</p>
                <p class="mb-0 text-secondary"><strong>Poste :</strong> {{ conv.candidature.offre.titre }} (du {{ conv.dateDebut | date:'dd/MM/yyyy' }} au {{ conv.dateFin | date:'dd/MM/yyyy' }})</p>
              </div>

              <div class="col-md-4 text-md-end mt-3 mt-md-0">
                <span class="badge p-2 mb-3 d-block" [ngClass]="getStatutBadgeClass(conv.statutValidation)">
                  {{ conv.statutValidation }}
                </span>

                <a [routerLink]="['/conventions', conv.id]" class="btn btn-primary fw-bold rounded-3 w-100">
                  🔍 Examiner & Signer
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TuteurDashboardComponent implements OnInit {
  conventions = signal<ConventionStage[]>([]);
  loading = signal<boolean>(true);

  constructor(private conventionService: ConventionService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.conventionService.getConventionsTuteur().subscribe({
      next: (data) => {
        this.conventions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'VALIDEE_ENTREPRISE': return 'bg-warning text-dark';
      case 'SIGNEE_FINALE': return 'bg-success';
      default: return 'bg-secondary';
    }
  }
}
