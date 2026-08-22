import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LucideAngularModule, X, Download, ExternalLink, Printer, FileText } from 'lucide-angular';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pdf-viewer.component.html'
})
export class PdfViewerComponent implements OnChanges {
  @Input() pdfUrl: string | null = null;
  @Input() pdfBlob: Blob | null = null;
  @Input() title: string = 'Prévisualisation du document';
  @Input() isOpen: boolean = false;

  @Output() close = new EventEmitter<void>();

  private sanitizer = inject(DomSanitizer);

  safeUrl: SafeResourceUrl | null = null;
  rawBlobUrl: string | null = null;
  readonly icons = { X, Download, ExternalLink, Printer, FileText };

  ngOnChanges(changes: SimpleChanges): void {
    // Recompute the URL when blob changes
    if (changes['pdfBlob'] && this.pdfBlob) {
      if (this.rawBlobUrl) {
        URL.revokeObjectURL(this.rawBlobUrl);
      }
      this.rawBlobUrl = URL.createObjectURL(this.pdfBlob);
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawBlobUrl);
    }

    // Recompute the URL when pdfUrl changes
    if (changes['pdfUrl'] && this.pdfUrl) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl);
      this.rawBlobUrl = this.pdfUrl;
    }

    // When the modal opens, make sure safeUrl is set if we already have a source
    if (changes['isOpen'] && this.isOpen) {
      if (this.pdfBlob && !this.safeUrl) {
        if (this.rawBlobUrl) {
          URL.revokeObjectURL(this.rawBlobUrl);
        }
        this.rawBlobUrl = URL.createObjectURL(this.pdfBlob);
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawBlobUrl);
      } else if (this.pdfUrl && !this.safeUrl) {
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl);
        this.rawBlobUrl = this.pdfUrl;
      }
    }

    // When modal closes, reset safeUrl so it refreshes on next open
    if (changes['isOpen'] && !this.isOpen) {
      this.safeUrl = null;
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  downloadPdf(): void {
    if (!this.rawBlobUrl) return;
    const a = document.createElement('a');
    a.href = this.rawBlobUrl;
    a.download = `${this.title.replace(/\s+/g, '_')}.pdf`;
    a.click();
  }

  openInNewTab(): void {
    if (this.rawBlobUrl) {
      window.open(this.rawBlobUrl, '_blank');
    }
  }
}

