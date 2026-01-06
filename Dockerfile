# ────────────────────────────────
# Stage 1: Build dell'applicazione
# ────────────────────────────────
FROM node:18-alpine AS build

# Imposta la directory di lavoro
WORKDIR /app

# Copia solo i file delle dipendenze
COPY package*.json ./

# Installa le dipendenze (pulito e riproducibile)
RUN npm ci

# Copia il resto del progetto (dopo aver installato dipendenze)
COPY . .

# Builda l'applicazione per la produzione
RUN npm run build

# ────────────────────────────────
# Stage 2: Servire l'applicazione con Nginx
# ────────────────────────────────
FROM nginx:alpine AS production

# Rimuovi la configurazione di default di Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia la build da Node
COPY --from=build /app/dist /usr/share/nginx/html

# Crea una configurazione Nginx ottimizzata per SPA React
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Routing per SPA (React/Vite)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache statica per assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Abilita gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Espone la porta HTTP
EXPOSE 80

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}


# Avvia Nginx
CMD ["nginx", "-g", "daemon off;"]
