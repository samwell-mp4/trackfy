# VideoSIA - Frontend com Supabase

## 🚀 Setup Rápido

### 1. Liberar Espaço em Disco

Você precisa liberar espaço no disco para instalar o Supabase:

```bash
# Limpar cache do npm
npm cache clean --force

# Depois instalar o Supabase
npm install @supabase/supabase-js
```

### 2. Configurar Supabase Database

No seu projeto Supabase (`https://okciydlceoohrkuqqeet.supabase.co`), execute este SQL:

```sql
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  usuario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ler seus próprios dados
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);
```

### 3. Criar Usuários de Teste

No Supabase Dashboard:

1. Vá em **Authentication** > **Users**
2. Clique em **Add user** > **Create new user**
3. Preencha:
   - Email: `teste@email.com`
   - Password: `senha123`
   - Auto Confirm User: ✅ (marque esta opção)
4. Clique em **Create user**

Depois, adicione os dados na tabela `users`:

```sql
INSERT INTO users (id, email, usuario)
VALUES (
  'cole-o-id-do-usuario-aqui',
  'teste@email.com',
  'Usuário Teste'
);
```

### 4. Rodar o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🔐 Como Funciona

1. **Login**: Usuário preenche email e senha
2. **Supabase Auth**: Valida credenciais
3. **Busca Dados**: Pega informações adicionais da tabela `users`
4. **Sessão**: Mantém usuário logado automaticamente
5. **Auto-logout**: Após 30 minutos de inatividade

## 📁 Estrutura

```
src/
├── lib/
│   └── supabase.ts          # Cliente Supabase
├── contexts/
│   └── AuthContext.tsx      # Contexto de autenticação
├── pages/
│   ├── Login.tsx            # Página de login
│   └── Dashboard.tsx        # Dashboard
└── App.tsx                  # Rotas
```

## ✅ Vantagens do Supabase

- ✅ **Mais simples** que Google OAuth
- ✅ **Autenticação nativa** com email/senha
- ✅ **Sessão automática** gerenciada pelo Supabase
- ✅ **Banco de dados** PostgreSQL incluído
- ✅ **Sem problemas de CORS**
- ✅ **Escalável** e gratuito para começar

## 🔧 Próximos Passos

1. Liberar espaço em disco
2. Instalar `@supabase/supabase-js`
3. Criar tabela `users` no Supabase
4. Criar usuário de teste
5. Testar login!

## 📝 Credenciais Configuradas

- **URL**: `https://okciydlceoohrkuqqeet.supabase.co`
- **Anon Key**: Já configurada no `.env`
