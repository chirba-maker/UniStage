package gn.univlabe.unistage.web;

import gn.univlabe.unistage.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Fichiers", description = "Téléchargement et consultation des CVs et conventions PDF")
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/download/{subDir}/{fileName:.+}")
    @Operation(summary = "Téléchargement d'un fichier par dossier et nom")
    public ResponseEntity<Resource> downloadFile(@PathVariable String subDir, @PathVariable String fileName, HttpServletRequest request) {
        String relativePath = subDir + "/" + fileName;
        Resource resource = fileStorageService.loadFileAsResource(relativePath);

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // fallback
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
