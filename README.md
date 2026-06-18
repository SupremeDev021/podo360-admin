# Podo360 Admin

Sistema interno da Podo360 para gestão de empresas contratantes, leads, status de acesso, auditoria administrativa e estrutura futura de planos.

## Responsabilidade

Este repositório não executa fluxo clínico e não deve editar prontuários, atendimentos ou dados assistenciais das clínicas.

Ele será responsável por:

- Leads vindos da Landing Page.
- Cadastro e gestão de empresas contratantes.
- Ativação, suspensão, inativação e reativação de empresas.
- Auditoria administrativa.
- Preparação de planos e feature flags futuras.

## Segurança

- Não usar `service_role` no frontend.
- Não acessar dados clínicos sem regra específica e auditoria.
- Não expor chaves reais.
- Usar RLS forte nas tabelas globais.
- Separar usuários administrativos da Podo360 dos usuários das clínicas.

## Variáveis de ambiente

Crie `.env` a partir de `.env.example`:

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

## Próximos passos

1. Criar migrations globais em etapa futura.
2. Criar autenticação administrativa.
3. Implementar listagem real de leads.
4. Implementar CRUD real de empresas.
5. Criar Edge Function para receber leads da Landing.
6. Integrar status da empresa com o Sistema Clínica.
