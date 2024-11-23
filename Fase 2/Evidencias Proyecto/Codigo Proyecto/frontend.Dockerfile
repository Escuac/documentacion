# Etapa única: Desarrollo del frontend
FROM node:22

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app/frontend

# Instalar dependencias con pnpm
RUN corepack enable pnpm
COPY frontend/package*.json ./
COPY frontend/pnpm-lock.yaml ./
RUN pnpm install

# Exponer el puerto por defecto de Vite
EXPOSE 5173

# Ejecutar el servidor de desarrollo de Vite
CMD ["pnpm", "run", "dev", "--host"]
