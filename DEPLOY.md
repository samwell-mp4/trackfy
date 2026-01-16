# Deploy no EasyPanel - SaaS Video

## 🏗️ Arquitetura

**Arquitetura Simplificada:** O backend serve tanto a API quanto os arquivos estáticos do frontend. Você só precisa expor **uma porta (80)** no EasyPanel.

```
┌─────────────────────────────┐
│   EasyPanel (Porta 80)      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Backend (Node.js/Express)  │
│  ┌─────────────────────┐    │
│  │  API Routes         │    │
│  │  /login             │    │
│  │  /api/*             │    │
│  │  /health            │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │  Static Files       │    │
│  │  (Frontend Build)   │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

## 📋 Pré-requisitos

Certifique-se de que as variáveis de ambiente estão configuradas corretamente:

### Backend (.env)
```env
PORT=80
JWT_SECRET=seu_jwt_secret_aqui
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_supabase
```

### Frontend (.env)
```env
VITE_API_URL=/
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_supabase
```

> **Nota:** O `VITE_API_URL=/` usa caminho relativo pois frontend e backend estão no mesmo domínio

## 🐳 Estrutura do Container

O Dockerfile criado:
- ✅ Usa Node.js 20 Alpine (leve e eficiente)
- ✅ Instala dependências de produção para ambos
- ✅ Faz build do frontend (Vite)
- ✅ Backend serve API + arquivos estáticos do frontend
- ✅ Expõe apenas porta 80
- ✅ Health check em `/health`

## 🚀 Deploy no EasyPanel

### 1. No EasyPanel

1. Acesse seu container "evolution"
2. Vá para o aplicativo "saas-video"
3. Configure para expor apenas a **porta 80**

### 2. Configurar Variáveis de Ambiente

No EasyPanel, adicione as variáveis de ambiente:

```env
PORT=80
JWT_SECRET=seu_jwt_secret_seguro_gerado_aleatoriamente
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon
N8N_WEBHOOK_URL=https://evolution-n8n.o9g2gq.easypanel.host/webhook-test/sua-webhook-id
```

> **Importante:** 
> - Não precisa configurar `VITE_*` no EasyPanel, pois essas variáveis são usadas apenas no build
> - O frontend `.env` já está configurado com `VITE_BACKEND_URL=` (vazio) para usar URLs relativas em produção

### 3. Build e Deploy

O EasyPanel irá:
1. Detectar o Dockerfile na raiz
2. Fazer build da imagem
3. Build do frontend será feito durante a criação da imagem
4. Iniciar o backend que serve tudo

### 4. Verificar Logs

Após o deploy, verifique os logs para confirmar:
```
Servidor rodando na porta 80
Frontend servido de: /app/frontend/dist
```

### 5. Acessar Aplicação

Acesse: `https://evolution-saas-video.o9g2gq.easypanel.host/`

✅ Frontend carregará corretamente  
✅ APIs estarão disponíveis no mesmo domínio  

## 🔧 Comandos Úteis para Testes Locais

### Build da imagem Docker:
```bash
docker build -t saas-video .
```

### Executar container:
```bash
docker run -p 80:80 -e PORT=80 -e JWT_SECRET=test -e SUPABASE_URL=sua_url -e SUPABASE_ANON_KEY=sua_key saas-video
```

### Testar localmente:
```bash
# Acesse
http://localhost:80
```

### Parar container:
```bash
docker stop $(docker ps -q --filter ancestor=saas-video)
```

## 📝 Notas Importantes

1. **Arquitetura Simplificada**: Backend serve frontend e API na mesma porta (80)
2. **CORS**: Não é mais necessário configurar CORS pois tudo está no mesmo domínio
3. **Segurança**: Em produção, use senhas hasheadas (bcrypt) ao invés de texto plano
4. **SSL/HTTPS**: O EasyPanel já fornece SSL automaticamente
5. **Health Check**: Endpoint `/health` disponível para monitoramento

## 🔍 Troubleshooting

### "Cannot GET /"
❌ **Problema:** Esse erro foi resolvido! Agora o backend serve o frontend corretamente.

### Erro 404 em rotas do React Router
✅ **Solução:** O backend tem um catch-all route que serve `index.html` para todas as rotas não-API, permitindo o React Router funcionar corretamente.

### API faz requisições para porta errada (ex: 8052, 3000)
❌ **Problema:** O frontend foi buildado com `VITE_BACKEND_URL` apontando para URL incorreta.

✅ **Solução:**
1. Certifique-se que `frontend/.env` tem `VITE_BACKEND_URL=` (vazio)
2. Rebuild o frontend: `cd frontend && npm run build`
3. Redeploy no EasyPanel

### API não responde
1. Verifique se as variáveis de ambiente estão configuradas
2. Confirme que a porta 80 está exposta no EasyPanel
3. Verifique os logs do container

## 🔐 Checklist de Segurança

- [ ] Alterar JWT_SECRET para um valor seguro e aleatório (use `openssl rand -base64 32`)
- [ ] HTTPS/SSL já está configurado automaticamente pelo EasyPanel ✅
- [ ] Implementar hash de senhas (bcrypt) no backend
- [ ] Adicionar rate limiting nas rotas de autenticação
- [ ] Configurar backup do Supabase
- [ ] Revisar permissões do Supabase (Row Level Security)
