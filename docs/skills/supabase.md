# Skill: Supabase

Padrões técnicos para uso do Supabase como plataforma (DB + Auth + Storage + Realtime).
Carregue junto com `docs/skills/backend.md` quando a tarefa envolver banco, autenticação ou storage.

> **Quando carregar esta skill:** tarefas que envolvam schema de banco, migrations, autenticação, upload de arquivos ou subscriptions em tempo real.

## Supabase como Plataforma

O Supabase é usado como plataforma completa:

| Serviço | Uso |
|---------|-----|
| Database | PostgreSQL managed — schema gerenciado via ORM |
| Auth | Autenticação e autorização de usuários |
| Storage | Upload e servir arquivos (imagens, assets) |
| Realtime | Subscriptions em tempo real (quando necessário) |

## Database — ORM + Supabase PostgreSQL

### Connection strings

```env
# Pooler (transaction mode) — para a aplicação
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direto (session mode) — apenas para migrations
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Regras

- ORM é o **dono do schema** — nunca usar Supabase Dashboard ou SQL Editor para DDL em produção
- Mudanças de schema sempre via migration do ORM (`migrate dev` / `migrate deploy`)
- RLS policies gerenciadas via SQL migrations versionadas
- Nunca usar `synchronize: true` ou equivalente em produção

## Auth — Supabase Auth

### Setup

- `@supabase/ssr` para server-side auth (Next.js App Router)
- `@supabase/supabase-js` para client-side auth
- Middleware do Next.js para proteção de rotas e refresh de sessão

### Padrões

- **Server-side**: sempre validar sessão com `supabase.auth.getUser()` — nunca confiar apenas no JWT decodificado
- **Client-side**: usar `onAuthStateChange` para reagir a mudanças de sessão
- **Proteção de rotas**: middleware do Next.js valida sessão e redireciona se expirada
- **NestJS**: validar JWT do Supabase via guard customizado — extrair `user.id` do token

### Fluxos suportados

- Email + senha (signup, login, reset password)
- OAuth providers (Google, GitHub, etc.) — configurar no Supabase Dashboard
- Magic link (opcional)

### Regras de segurança

- Nunca armazenar senhas — Supabase Auth gerencia tudo
- Refresh token é gerenciado automaticamente pelo SDK
- Logout deve chamar `supabase.auth.signOut()` + limpar cookies
- Em APIs NestJS: extrair `sub` do JWT para identificar o usuário — nunca confiar em parâmetros do client

## Storage — Supabase Storage

### Regras

- **Privado por padrão** — buckets públicos apenas para assets que não precisam de autenticação
- Upload via **signed URLs** — nunca expor `service_role` key ao client
- RLS policies em `storage.objects` para controle de acesso
- Limites de tamanho configurados por bucket no Dashboard

### Pattern de upload

```
1. Client solicita signed URL ao backend
2. Backend gera signed URL com supabase.storage (usando service_role)
3. Client faz upload direto ao Storage via signed URL
4. Client confirma upload ao backend
5. Backend salva referência (path) no banco
```

### Servir arquivos

- Arquivos públicos: URL direta do bucket público
- Arquivos privados: signed URL com expiração (gerada no backend)

## Realtime — Supabase Realtime

### Quando usar

- ✅ Features que realmente precisam de tempo real (chat, notificações ao vivo, colaboração)
- ❌ **Não usar** para dados que podem ser buscados via polling ou TanStack Query invalidation

### Regras

- Channels com RLS — nunca broadcast dados sensíveis sem policy
- Limpar subscriptions no `useEffect` cleanup ou equivalente
- Preferir `postgres_changes` sobre `broadcast` quando dados vêm do banco

## Clean Architecture — Integração

### Princípio fundamental

**Supabase SDK vive APENAS na camada de Infrastructure.** Nunca importar `@supabase/supabase-js` em Services, Use Cases ou Entities.

### Patterns de abstração

```
Interface (Domain)              →  Implementação (Infrastructure)
─────────────────────────────────────────────────────────────────
IAuthService                    →  SupabaseAuthService
IStorageService                 →  SupabaseStorageService
IUserRepository                 →  PrismaUserRepository (via Supabase DB)
```

### DI (NestJS)

```typescript
// No módulo
{
  provide: IAuthService,
  useClass: SupabaseAuthService,
}
```

### Supabase Client no NestJS

- Criar `SupabaseModule` que fornece client configurado via DI
- Client inicializado com `service_role` key (backend) — nunca `anon` key no server
- Singleton por aplicação — não criar client por request

## Segurança — Gerenciamento de Keys

| Key | Onde usar | Pode expor ao client? |
|-----|-----------|----------------------|
| `SUPABASE_URL` | Frontend + Backend | ✅ Sim (é pública) |
| `SUPABASE_ANON_KEY` | Frontend | ✅ Sim (é pública, RLS protege) |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend APENAS | ❌ NUNCA |

### Variáveis de ambiente

```env
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend (.env)
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

## RLS (Row Level Security)

### Regras fundamentais

- **RLS ATIVO por padrão** em toda tabela nova — sem exceções
- Policies escritas em SQL e versionadas em migrations do ORM
- Testar policies com diferentes roles antes de deploy

### Multi-tenant

```sql
-- Exemplo: policy de isolamento por usuário
CREATE POLICY "users_own_data" ON "public"."workouts"
  FOR ALL
  USING (auth.uid() = user_id);
```

### Cuidados

- Se usar `service_role` key no backend, RLS é **bypassado** — validar ownership na camada de service
- Nunca desativar RLS "temporariamente" — criar policy permissiva se necessário para debug

## Environments

| Ambiente | Supabase Project | Migrations |
|----------|-----------------|------------|
| Development | Project de dev (ou local via `supabase start`) | `migrate dev` |
| Staging | Project de staging | `migrate deploy` via CI |
| Production | Project de prod | `migrate deploy` via CI |

### Supabase CLI (local dev)

```bash
supabase start          # Sobe Supabase local (Docker)
supabase db reset       # Reset + re-seed
supabase gen types      # Gera tipos TypeScript do schema
```

### CI/CD

- Migrations aplicadas via pipeline — nunca manualmente em prod
- Seed data via ORM seed command — não via Dashboard
- Types gerados automaticamente e commitados (ou gerados no CI)
