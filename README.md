# Podo360 Admin

Sistema interno da Podo360 para gestão de empresas contratantes, leads, status de acesso, planos, extras, contratos, feature flags, avisos globais e auditoria administrativa.

## Responsabilidade

Este repositório não executa fluxo clínico e não deve editar prontuários, atendimentos ou dados assistenciais das clínicas.

Ele é responsável por:

- Leads vindos da Landing Page.
- Cadastro e gestão de empresas contratantes.
- Ativação, suspensão, inativação e reativação de empresas.
- Gestão dos planos Start, Clinic, Pro e Master.
- Gestão de extras comerciais.
- Controle administrativo de assinaturas e contratos.
- Feature flags futuras.
- Avisos globais para o Sistema Clínica.
- Auditoria administrativa.

## Segurança

- Não usar `service_role` no frontend.
- Não acessar dados clínicos sem regra específica e auditoria.
- Não expor chaves reais.
- Não versionar `.env`.
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

## Produção

Não aplique migrations no Supabase produção até validação explícita do responsável. A frase obrigatória para seguir com banco real é:

```text
APROVADO PRODUÇÃO SUPABASE
```
