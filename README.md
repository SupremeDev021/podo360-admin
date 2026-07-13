# Podo360 Admin

Sistema Admin Global separado da Podo360 para gestao de empresas contratantes, leads, planos, extras, assinaturas, feature flags, avisos globais e auditoria administrativa.

## Responsabilidade

Este repositorio nao executa fluxo clinico e nao deve editar prontuarios, atendimentos ou dados assistenciais das clinicas.

Ele e responsavel por:

- Leads vindos da Landing Page.
- Cadastro e gestao de empresas contratantes.
- Ativacao, suspensao, inativacao e reativacao de empresas.
- Gestao dos planos Start, Clinic, Pro e Master.
- Gestao de extras comerciais.
- Controle administrativo de assinaturas e contratos.
- Limite de usuarios ativos por clinica, conforme plano ou contrato.
- Feature flags futuras.
- Avisos globais para o Sistema Clinica.
- Auditoria administrativa.

## Acesso

O usuario precisa existir no Supabase Auth e tambem em `public.platform_admin_users`.

Exemplo para vincular um usuario Auth como Admin Global:

```sql
insert into public.platform_admin_users (user_id, role, active)
values ('<auth_user_id>', 'owner', true)
on conflict (user_id) do update set
  role = excluded.role,
  active = true,
  updated_at = now();
```

Nunca coloque senha nesse SQL.

## GitHub Pages

Como o GitHub Pages nao faz rewrite de rotas SPA, o Admin usa hash routing em producao.

URLs principais:

- `https://supremedev021.github.io/podo360-admin/#/admin/login`
- `https://supremedev021.github.io/podo360-admin/#/admin/dashboard`

O owner inicial do Admin Global ja foi criado. Nao existe rota publica de setup
para criar administradores em producao. Novos administradores devem ser criados
por fluxo operacional controlado no Supabase/Auth e vinculados em
`platform_admin_users` por SQL revisado, sem senha em codigo, migration ou
documento.

## Limite de usuarios por clinica

A tela de Empresas permite definir o limite maximo de usuarios ativos da clinica.

O valor e salvo em:

```text
public.platform_company_subscriptions.max_users
```

Regras:

- campo vazio: ilimitado;
- `0`: bloqueia novos usuarios ativos;
- numero maior que `0`: limite contratado.

O Sistema Clinica valida esse limite antes de convidar ou reativar usuarios.

## Seguranca

- Nao usar `service_role` no frontend.
- Nao expor chaves reais.
- Nao versionar `.env`, `.env.local` ou `.env.test.local`.
- Usar apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no navegador.
- Usar RLS forte nas tabelas globais.
- Separar usuarios administrativos da Podo360 dos usuarios das clinicas.
- Leaked Password Protection do Supabase Auth exige Supabase Pro ou superior no projeto atual; manter como pendencia operacional ate upgrade do plano.

## Variaveis de ambiente

Crie `.env.local` a partir de `.env.example`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_URL=
```

## Scripts

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

## Producao

O Admin separado carrega dados reais das tabelas `platform_*` via Supabase Auth e RLS. Ele nao deve exibir dados mockados em producao.

Nao aplique migrations no Supabase producao ate validacao explicita do responsavel.
