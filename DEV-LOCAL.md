# Desenvolvimento Local

Se você está desenvolvendo localmente e precisa do frontend e backend rodando separadamente:

## 1. Backend (porta 3000)
```bash
cd backend
npm install
npm start
```

## 2. Frontend (porta 3100)

Crie o arquivo `frontend/.env.local`:
```bash
VITE_BACKEND_URL=http://localhost:3000
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_key
VITE_N8N_WEBHOOK_BASE_URL=sua_url_n8n
```

Em seguida:
```bash
cd frontend
npm install
npm run dev
```

O frontend estará em `http://localhost:3100` e fará requisições para `http://localhost:3000`.

## 3. Build de Produção Local

Para testar o build de produção localmente:

```bash
cd frontend
npm run build
cd ../backend
npm start
```

Acesse `http://localhost:80` (ou a porta configurada em `backend/.env`).

---

**Nota:** No modo de produção (deploy), não é necessário configurar `VITE_BACKEND_URL` porque o backend serve o frontend e usa URLs relativas.
