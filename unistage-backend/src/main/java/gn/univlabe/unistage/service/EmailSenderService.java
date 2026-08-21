package gn.univlabe.unistage.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
public class EmailSenderService {

    // Injection optionnelle : le backend démarre même sans serveur SMTP configuré
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@univ-labe.edu.gn}")
    private String fromEmail;

    @Async
    public void sendEmailWithAttachment(String toEmail, String subject, String bodyText, byte[] attachmentBytes, String attachmentFilename) {
        if (mailSender == null) {
            log.info("[EMAIL SIMULATION] À: {} | Sujet: {} | (Aucun serveur SMTP configuré - mode simulation)", toEmail, subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(bodyText, true);

            if (attachmentBytes != null && attachmentFilename != null) {
                helper.addAttachment(attachmentFilename, new ByteArrayResource(attachmentBytes));
            }

            mailSender.send(message);
            log.info("Email envoyé avec succès à {}", toEmail);
        } catch (Exception ex) {
            log.warn("Impossible d'envoyer l'email à {} (Mode Simulation). Sujet: {} | Erreur: {}",
                    toEmail, subject, ex.getMessage());
        }
    }

    @Async
    public void sendSimpleEmail(String toEmail, String subject, String bodyText) {
        sendEmailWithAttachment(toEmail, subject, bodyText, null, null);
    }
}
