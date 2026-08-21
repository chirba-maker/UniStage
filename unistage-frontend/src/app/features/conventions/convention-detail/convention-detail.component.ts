import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ConventionService } from '../../../core/services/convention.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuditService } from '../../../core/services/audit.service';
import { RapportEvaluationService } from '../../../core/services/rapport-evaluation.service';
import { ConventionStage, StatutConventionEnum, UpdateConventionDto } from '../../../core/models/convention.model';
import { RoleEnum } from '../../../core/models/user.model';
import { AuditConventionDto } from '../../../core/models/audit.model';
import { RapportStageDto, SubmitRapportDto, EvaluationTuteurDto, SubmitEvaluationDto } from '../../../core/models/rapport-evaluation.model';
import { PdfViewerComponent } from '../../../shared/components/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-convention-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PdfViewerComponent],
  templateUrl: './convention-detail.component.html',
  styleUrls: ['./convention-detail.component.scss']
})
export class ConventionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private conventionService = inject(ConventionService);
  private authService = inject(AuthService);
  private auditService = inject(AuditService);
  private rapportEvalService = inject(RapportEvaluationService);

  convention = signal<ConventionStage | null>(null);
  auditLogs = signal<AuditConventionDto[]>([]);
  rapportStage = signal<RapportStageDto | null>(null);
  evaluationTuteur = signal<EvaluationTuteurDto | null>(null);

  editForm: UpdateConventionDto = { dateDebut: '', dateFin: '', missions: '', gratification: 0 };
  saving = signal<boolean>(false);
  processing = signal<boolean>(false);

  // PDF Viewer State
  isPdfModalOpen = signal<boolean>(false);
  pdfModalTitle = signal<string>('Document PDF');
  pdfModalBlob = signal<Blob | null>(null);
  pdfModalUrl = signal<string | null>(null);
  loadingPdf = signal<boolean>(false);

  // Rapport Deposit Form (Étudiant)
  rapportForm: SubmitRapportDto = { titre: '', resume: '' };
  selectedRapportFile: File | null = null;
  submittingRapport = signal<boolean>(false);

  // Evaluation Form (Tuteur)
  evalForm: SubmitEvaluationDto = {
    noteQualiteTravail: 15,
    noteAutonomie: 15,
    noteAssiduite: 15,
    noteIntegration: 15,
    appreciationGlobale: ''
  };
  selectedEvalFile: File | null = null;
  submittingEval = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAllData(+id);
    }
  }

  loadAllData(id: number): void {
    this.conventionService.getConventionById(id).subscribe({
      next: (data) => {
        this.convention.set(data);
        this.editForm = {
          dateDebut: data.dateDebut,
          dateFin: data.dateFin,
          missions: data.missions,
          gratification: data.gratification
        };
      }
    });

    this.auditService.getAuditTrail(id).subscribe({
      next: (logs) => this.auditLogs.set(logs),
      error: () => this.auditLogs.set([])
    });

    this.rapportEvalService.getRapport(id).subscribe({
      next: (rap) => this.rapportStage.set(rap),
      error: () => this.rapportStage.set(null)
    });

    this.rapportEvalService.getEvaluation(id).subscribe({
      next: (ev) => this.evaluationTuteur.set(ev),
      error: () => this.evaluationTuteur.set(null)
    });
  }

  // --- PDF PREVIEW ---

  openConventionPdfPreview(): void {
    if (!this.convention()) return;
    const convId = this.convention()!.id;
    this.pdfModalTitle.set(`Convention de Stage N° ${convId}`);
    this.loadingPdf.set(true);
    this.isPdfModalOpen.set(true);

    this.conventionService.getPreviewPdf(convId).subscribe({
      next: (blob) => {
        this.pdfModalBlob.set(blob);
        this.pdfModalUrl.set(null);
        this.loadingPdf.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du PDF', err);
        this.loadingPdf.set(false);
      }
    });
  }

  openDocumentUrlPreview(title: string, relativeUrl: string): void {
    if (!relativeUrl) return;
    const fullUrl = this.conventionService.getFileUrl(relativeUrl);
    this.pdfModalTitle.set(title);
    this.pdfModalUrl.set(fullUrl);
    this.pdfModalBlob.set(null);
    this.isPdfModalOpen.set(true);
  }

  closePdfModal(): void {
    this.isPdfModalOpen.set(false);
    this.pdfModalBlob.set(null);
    this.pdfModalUrl.set(null);
  }

  // --- ACTIONS WORKFLOW ---

  onSaveDetails(): void {
    if (!this.convention()) return;
    this.saving.set(true);
    this.conventionService.updateDetails(this.convention()!.id, this.editForm).subscribe({
      next: (data) => {
        this.convention.set(data);
        this.saving.set(false);
        this.loadAllData(data.id);
      },
      error: () => this.saving.set(false)
    });
  }

  validerEntreprise(): void {
    if (!this.convention()) return;
    this.processing.set(true);
    this.conventionService.validerParEntreprise(this.convention()!.id).subscribe({
      next: (data) => {
        this.convention.set(data);
        this.processing.set(false);
        this.loadAllData(data.id);
      },
      error: () => this.processing.set(false)
    });
  }

  validerTuteur(): void {
    if (!this.convention()) return;
    this.processing.set(true);
    this.conventionService.validerParTuteur(this.convention()!.id).subscribe({
      next: (data) => {
        this.convention.set(data);
        this.processing.set(false);
        this.loadAllData(data.id);
      },
      error: () => this.processing.set(false)
    });
  }

  // --- RAPPORT ETUDIANT ---

  onRapportFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedRapportFile = file;
    }
  }

  onSubmitRapport(): void {
    if (!this.convention() || !this.selectedRapportFile || !this.rapportForm.titre) return;
    this.submittingRapport.set(true);

    this.rapportEvalService.submitRapport(this.convention()!.id, this.rapportForm, this.selectedRapportFile).subscribe({
      next: (res) => {
        this.rapportStage.set(res);
        this.submittingRapport.set(false);
        this.loadAllData(this.convention()!.id);
      },
      error: () => this.submittingRapport.set(false)
    });
  }

  // --- EVALUATION TUTEUR ---

  onEvalFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedEvalFile = file;
    }
  }

  onSubmitEvaluation(): void {
    if (!this.convention()) return;
    this.submittingEval.set(true);

    this.rapportEvalService.submitEvaluation(this.convention()!.id, this.evalForm, this.selectedEvalFile || undefined).subscribe({
      next: (res) => {
        this.evaluationTuteur.set(res);
        this.submittingEval.set(false);
        this.loadAllData(this.convention()!.id);
      },
      error: () => this.submittingEval.set(false)
    });
  }

  // --- HELPERS ---

  isEtudiant(): boolean {
    return this.authService.hasRole(RoleEnum.ROLE_ETUDIANT);
  }

  isEntreprise(): boolean {
    return this.authService.hasRole(RoleEnum.ROLE_ENTREPRISE);
  }

  isTuteur(): boolean {
    return this.authService.hasRole(RoleEnum.ROLE_TUTEUR);
  }

  isAdmin(): boolean {
    return this.authService.hasRole(RoleEnum.ROLE_ADMIN);
  }

  isFinalSigned(): boolean {
    return this.convention()?.statutValidation === StatutConventionEnum.SIGNEE_FINALE;
  }

  getPdfDownloadUrl(): string {
    return this.conventionService.getFileUrl(this.convention()?.pdfUrl);
  }

  isStepCompleted(step: number): boolean {
    const s = this.convention()?.statutValidation;
    if (!s) return false;
    if (step === 1) return true;
    if (step === 2) return s === 'VALIDEE_ENTREPRISE' || s === 'VALIDEE_TUTEUR' || s === 'SIGNEE_FINALE';
    if (step === 3) return s === 'VALIDEE_TUTEUR' || s === 'SIGNEE_FINALE';
    if (step === 4) return s === 'SIGNEE_FINALE';
    return false;
  }

  getStatutBadgeClass(statut: StatutConventionEnum): string {
    switch (statut) {
      case StatutConventionEnum.BROUILLON: return 'bg-secondary';
      case StatutConventionEnum.SOUMISE: return 'bg-info text-dark';
      case StatutConventionEnum.VALIDEE_ENTREPRISE: return 'bg-warning text-dark';
      case StatutConventionEnum.SIGNEE_FINALE: return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'ROLE_ETUDIANT': return 'bg-info text-dark fw-bold';
      case 'ROLE_ENTREPRISE': return 'bg-primary text-white fw-bold';
      case 'ROLE_TUTEUR': return 'bg-success text-white fw-bold';
      case 'ROLE_ADMIN': return 'bg-danger text-white fw-bold';
      default: return 'bg-secondary text-white fw-bold';
    }
  }
}
