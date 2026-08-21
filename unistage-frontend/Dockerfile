# =========================================================================
# Stage 1: Build de l'application Angular
# =========================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copie et installation des dépendances (mise en cache)
COPY package*.json ./
RUN npm ci

# Copie du code source et compilation de production
COPY . .
RUN npm run build -- --configuration production

# =========================================================================
# Stage 2: Serveur Web Nginx haute performance
# =========================================================================
FROM nginx:1.25-alpine

# Suppression de la page d'accueil par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copie des fichiers compilés depuis le builder
COPY --from=builder /app/dist/unistage-frontend/browser /usr/share/nginx/html

# Copie de la configuration Nginx optimisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
