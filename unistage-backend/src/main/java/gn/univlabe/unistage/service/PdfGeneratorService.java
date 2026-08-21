package gn.univlabe.unistage.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import gn.univlabe.unistage.domain.entities.ConventionStage;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
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
            missionsBody.setSpacingAfter(25);
            document.add(missionsBody);

            // Signatures Table
            PdfPTable sigTable = new PdfPTable(3);
            sigTable.setWidthPercentage(100);

            PdfPCell sig1 = new PdfPCell(new Paragraph("Signature Étudiant\n\n\n__________________", bodyBoldFont));
            sig1.setBorder(Rectangle.NO_BORDER);
            sig1.setHorizontalAlignment(Element.ALIGN_CENTER);

            PdfPCell sig2 = new PdfPCell(new Paragraph("Cachet & Signature Entreprise\n\n\n__________________", bodyBoldFont));
            sig2.setBorder(Rectangle.NO_BORDER);
            sig2.setHorizontalAlignment(Element.ALIGN_CENTER);

            PdfPCell sig3 = new PdfPCell(new Paragraph("Validation Université / Tuteur\n\n\n__________________", bodyBoldFont));
            sig3.setBorder(Rectangle.NO_BORDER);
            sig3.setHorizontalAlignment(Element.ALIGN_CENTER);

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
