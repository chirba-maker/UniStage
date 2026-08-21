package gn.univlabe.unistage.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import gn.univlabe.unistage.domain.entities.ConventionStage;
import gn.univlabe.unistage.domain.enums.StatutConventionEnum;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PdfGeneratorService {

    public byte[] generateConventionPdf(ConventionStage convention) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Font Styles
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(41, 128, 185));
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.BLACK);
            Font bodyBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);

            // Title / Header
            Paragraph header = new Paragraph("UNIVERSITÉ DE LABÉ — RÉPUBLIQUE DE GUINÉE", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            Paragraph subHeader = new Paragraph("Service des Stages & de l'Insertion Professionnelle", subHeaderFont);
            subHeader.setAlignment(Element.ALIGN_CENTER);
            subHeader.setSpacingAfter(15);
            document.add(subHeader);

            Paragraph title = new Paragraph("CONVENTION DE STAGE OFFICIELLE N° " + convention.getId(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(192, 57, 43)));
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Table 1: Information Parties
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingAfter(15);

            // Left: Student Info
            PdfPCell cellStudent = new PdfPCell();
            cellStudent.setPadding(8);
            cellStudent.setBackgroundColor(new Color(245, 247, 250));
            cellStudent.addElement(new Paragraph("🎓 ÉTUDIANT STAGIAIRE", sectionTitleFont));
            cellStudent.addElement(new Paragraph("Nom & Prénom: " + convention.getCandidature().getEtudiant().getNom() + " " + convention.getCandidature().getEtudiant().getPrenom(), bodyFont));
            cellStudent.addElement(new Paragraph("Matricule: " + convention.getCandidature().getEtudiant().getMatricule(), bodyFont));
            cellStudent.addElement(new Paragraph("Filière & Niveau: " + convention.getCandidature().getEtudiant().getFiliere() + " (" + convention.getCandidature().getEtudiant().getNiveau() + ")", bodyFont));
            cellStudent.addElement(new Paragraph("Email: " + convention.getCandidature().getEtudiant().getUser().getEmail(), bodyFont));
            table.addCell(cellStudent);

            // Right: Entreprise Info
            PdfPCell cellEntreprise = new PdfPCell();
            cellEntreprise.setPadding(8);
            cellEntreprise.setBackgroundColor(new Color(245, 247, 250));
            cellEntreprise.addElement(new Paragraph("🏢 ENTREPRISE D'ACCUEIL", sectionTitleFont));
            cellEntreprise.addElement(new Paragraph("Raison sociale: " + convention.getCandidature().getOffre().getEntreprise().getNomEntreprise(), bodyFont));
            cellEntreprise.addElement(new Paragraph("Secteur d'activité: " + convention.getCandidature().getOffre().getEntreprise().getSecteurActivite(), bodyFont));
            cellEntreprise.addElement(new Paragraph("Téléphone: " + convention.getCandidature().getOffre().getEntreprise().getTelephone(), bodyFont));
            cellEntreprise.addElement(new Paragraph("Adresse: " + convention.getCandidature().getOffre().getEntreprise().getAdresse(), bodyFont));
            table.addCell(cellEntreprise);

            document.add(table);

            // Section Stage Details
            Paragraph detailsHeader = new Paragraph("📋 DÉTAILS DU STAGE & MISSIONS", sectionTitleFont);
            detailsHeader.setSpacingAfter(10);
            document.add(detailsHeader);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            document.add(new Paragraph("Intitulé du poste: " + convention.getCandidature().getOffre().getTitre(), bodyBoldFont));
            document.add(new Paragraph("Période du stage: Du " + convention.getDateDebut().format(formatter) + " au " + convention.getDateFin().format(formatter), bodyFont));
            document.add(new Paragraph("Lieu d'exécution: " + convention.getCandidature().getOffre().getLieu(), bodyFont));
            document.add(new Paragraph("Gratification mensuelle: " + (convention.getGratification() != null ? convention.getGratification() + " GNF / mois" : "Non gratifié"), bodyFont));
            
            if (convention.getTuteur() != null) {
                document.add(new Paragraph("Tuteur Académique: Prof. " + convention.getTuteur().getNom() + " " + convention.getTuteur().getPrenom() + " (" + convention.getTuteur().getDepartement() + ")", bodyFont));
            }

            Paragraph missionsTitle = new Paragraph("\nMissions confiées:", bodyBoldFont);
            document.add(missionsTitle);
            Paragraph missionsBody = new Paragraph(convention.getMissions(), bodyFont);
            missionsBody.setSpacingAfter(20);
            document.add(missionsBody);

            // Signatures Table (Tripartite Signatures & Seals)
            PdfPTable sigTable = new PdfPTable(3);
            sigTable.setWidthPercentage(100);
            sigTable.setSpacingBefore(15);

            DateTimeFormatter dtFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            // Cell 1: Student Signature
            PdfPCell sig1 = new PdfPCell();
            sig1.setPadding(8);
            sig1.setBackgroundColor(new Color(248, 250, 252));
            sig1.addElement(new Paragraph("1. ÉTUDIANT STAGIAIRE", bodyBoldFont));
            if (convention.getDateSignatureEtudiant() != null || convention.getStatutValidation() != StatutConventionEnum.BROUILLON) {
                String dateEt = convention.getDateSignatureEtudiant() != null ? convention.getDateSignatureEtudiant().format(dtFormatter) : LocalDateTime.now().format(dtFormatter);
                sig1.addElement(new Paragraph("✅ SIGNÉ NUMÉRIQUEMENT", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(39, 174, 96))));
                sig1.addElement(new Paragraph("Nom: " + convention.getCandidature().getEtudiant().getPrenom() + " " + convention.getCandidature().getEtudiant().getNom(), bodyFont));
                sig1.addElement(new Paragraph("Date: " + dateEt, bodyFont));
                sig1.addElement(new Paragraph("Ref: UNISTAGE-SIG-ETU-" + convention.getId(), FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, Color.GRAY)));
            } else {
                sig1.addElement(new Paragraph("\n⏳ En attente de signature\n\n__________________", bodyFont));
            }

            // Cell 2: Enterprise Signature & Stamp
            PdfPCell sig2 = new PdfPCell();
            sig2.setPadding(8);
            sig2.setBackgroundColor(new Color(248, 250, 252));
            sig2.addElement(new Paragraph("2. CACHET & ENTREPRISE", bodyBoldFont));
            if (convention.getDateSignatureEntreprise() != null || convention.getStatutValidation() == StatutConventionEnum.VALIDEE_ENTREPRISE || convention.getStatutValidation() == StatutConventionEnum.VALIDEE_TUTEUR || convention.getStatutValidation() == StatutConventionEnum.SIGNEE_FINALE) {
                String dateEnt = convention.getDateSignatureEntreprise() != null ? convention.getDateSignatureEntreprise().format(dtFormatter) : LocalDateTime.now().format(dtFormatter);
                sig2.addElement(new Paragraph("✅ CACHETÉ & VALIDÉ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(41, 128, 185))));
                sig2.addElement(new Paragraph("Sté: " + convention.getCandidature().getOffre().getEntreprise().getNomEntreprise(), bodyFont));
                sig2.addElement(new Paragraph("Date: " + dateEnt, bodyFont));
                sig2.addElement(new Paragraph("Ref: UNISTAGE-STAMP-ENT-" + convention.getId(), FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, Color.GRAY)));
            } else {
                sig2.addElement(new Paragraph("\n⏳ En attente de validation\n\n__________________", bodyFont));
            }

            // Cell 3: University / Tutor Validation & Official Seal
            PdfPCell sig3 = new PdfPCell();
            sig3.setPadding(8);
            sig3.setBackgroundColor(new Color(248, 250, 252));
            sig3.addElement(new Paragraph("3. SCEAU UNIVERSITÉ DE LABÉ", bodyBoldFont));
            if (convention.getDateSignatureTuteur() != null || convention.getStatutValidation() == StatutConventionEnum.SIGNEE_FINALE) {
                String dateTut = convention.getDateSignatureTuteur() != null ? convention.getDateSignatureTuteur().format(dtFormatter) : LocalDateTime.now().format(dtFormatter);
                sig3.addElement(new Paragraph("✅ APPROUBÉ & SIGNÉ FINALE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(142, 68, 173))));
                if (convention.getTuteur() != null) {
                    sig3.addElement(new Paragraph("Tuteur: Prof. " + convention.getTuteur().getPrenom() + " " + convention.getTuteur().getNom(), bodyFont));
                }
                sig3.addElement(new Paragraph("Date: " + dateTut, bodyFont));
                sig3.addElement(new Paragraph("Sceau: REPUBLIQUE DE GUINÉE - LABÉ", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, new Color(192, 57, 43))));
            } else {
                sig3.addElement(new Paragraph("\n⏳ En attente de validation tuteur\n\n__________________", bodyFont));
            }

            sigTable.addCell(sig1);
            sigTable.addCell(sig2);
            sigTable.addCell(sig3);

            document.add(sigTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF de la convention", e);
        }
    }
}
