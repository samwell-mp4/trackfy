# ========================================
# Multi-service Dockerfile
# Frontend (React + Vite) + Backend (Node.js + Express)
# ========================================
FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache bash curl python3 ffmpeg

# Diretório de trabalho
WORKDIR /app

# ========================================
# BACKEND - Node.js puro (sem build necessário)
# ========================================
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copiar código-fonte do backend
COPY backend ./

# ========================================
# FRONTEND - React + Vite (requer build)
# ========================================
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

# Copiar código-fonte do frontend
COPY frontend ./

# Build de produção do frontend
RUN npm run build

# ========================================
# Inicialização
# Backend serve tanto a API quanto o frontend buildado
# ========================================
WORKDIR /app/backend

# Expor apenas a porta do backend (que agora serve tudo)
EXPOSE 80

# Health check para garantir que o serviço está rodando
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Comando de inicialização
CMD ["npm", "start"]
