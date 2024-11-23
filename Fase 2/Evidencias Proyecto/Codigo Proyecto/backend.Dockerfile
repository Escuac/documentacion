# Etapa 1: Construcción de la aplicación (en la carpeta frontend)
FROM node:22 AS builder
WORKDIR /app/backend

# Copiar el package.json y package-lock.json para instalar dependencias

RUN corepack enable pnpm
COPY backend/package.json ./
COPY /.env.backend ./.env
RUN pnpm install

# Copiar todo el código fuente del backend

# Exponer el puerto 5000
EXPOSE 5000

# Ejecutar Nginx en modo no-daemon para mantener el contenedor activo
CMD ["pnpm", "start"]
