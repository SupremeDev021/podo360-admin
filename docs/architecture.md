# Arquitetura do Podo360 Admin

## Objetivo

O `podo360-admin` é o sistema interno da Podo360 para gerenciar a base comercial e administrativa da plataforma.

## Escopo

- Leads.
- Empresas contratantes.
- Status de acesso.
- Auditoria administrativa.
- Planos futuros.
- Feature flags futuras.

## Fora do escopo

- Atendimentos clínicos.
- Anamnese.
- Prontuário.
- Financeiro interno da clínica.
- Estoque interno da clínica.
- Dados clínicos sem regra e auditoria específica.

## Integrações futuras

```text
podo360-landing -> Edge Function/API -> platform_leads -> podo360-admin
podo360-admin -> platform_companies/status -> podo360
```

## Tabelas futuras

- `platform_companies`
- `platform_leads`
- `platform_company_status_logs`
- `platform_admin_users`
- `platform_plans`
- `platform_company_subscriptions`
- `feature_flags`
- `company_feature_flags`
