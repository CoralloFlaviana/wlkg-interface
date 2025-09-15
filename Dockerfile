# Multi-stage Dockerfile per applicazione React + Vite

# Stage 1: Build dell'applicazione
FROM node:18-alpine AS build

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file di configurazione delle dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm ci

# Copia tutto il codice sorgente
COPY . .

# Builda l'applicazione per la produzione
RUN npm run build

# Stage 2: Servire l'applicazione con Nginx
FROM nginx:alpine AS production

# Rimuovi la configurazione di default di Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia i file buildati dalla stage precedente
COPY --from=build /app/dist /usr/share/nginx/html

# Crea una configurazione Nginx ottimizzata per SPA React
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gestione del routing client-side per SPA
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache statica per assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Compressione gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Esponi la porta 80
EXPOSE 80

# Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]