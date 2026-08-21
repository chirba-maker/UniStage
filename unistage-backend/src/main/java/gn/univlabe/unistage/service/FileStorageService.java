package gn.univlabe.unistage.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            Files.createDirectories(this.fileStorageLocation.resolve("cvs"));
            Files.createDirectories(this.fileStorageLocation.resolve("logos"));
            Files.createDirectories(this.fileStorageLocation.resolve("conventions"));
        } catch (Exception ex) {
            throw new RuntimeException("Impossible de créer le répertoire de stockage des fichiers.", ex);
        }
    }

    public String storeFile(MultipartFile file, String subDir) {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = "";

        if (originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String newFileName = UUID.randomUUID() + fileExtension;
        try {
            if (newFileName.contains("..")) {
                throw new RuntimeException("Nom de fichier invalide : " + originalFilename);
            }

            Path targetLocation = this.fileStorageLocation.resolve(subDir).resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return subDir + "/" + newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Impossible de stocker le fichier " + originalFilename + ". Veuillez réessayer!", ex);
        }
    }

    public String storeBytes(byte[] bytes, String subDir, String fileNamePrefix, String extension) {
        String fileName = fileNamePrefix + "_" + UUID.randomUUID() + "." + extension;
        try {
            Path targetLocation = this.fileStorageLocation.resolve(subDir).resolve(fileName);
            Files.write(targetLocation, bytes);
            return subDir + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Impossible de sauvegarder le fichier de données.", ex);
        }
    }

    public Resource loadFileAsResource(String relativePath) {
        try {
            Path filePath = this.fileStorageLocation.resolve(relativePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("Fichier non trouvé : " + relativePath);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("Fichier non trouvé : " + relativePath, ex);
        }
    }
}
