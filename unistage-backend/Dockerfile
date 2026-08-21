# =========================================================================
# Stage 1: Build l'application avec Maven
# =========================================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# 1. Mise en cache des dépendances Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 2. Copie du code source et compilation
COPY src ./src
RUN mvn clean package -DskipTests -B

# =========================================================================
# Stage 2: Image finale d'exécution (ultra-légère et sécurisée)
# =========================================================================
FROM eclipse-temurin:17-jre-alpine

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app

# Récupération du JAR compilé depuis le stage 1
COPY --from=builder /build/target/*.jar app.jar

# Dossier d'upload pour les fichiers locaux
USER root
RUN mkdir -p /app/uploads && chown -R spring:spring /app/uploads
USER spring:spring

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
