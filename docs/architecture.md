# Arquitetura do Podo360 Admin

## Objetivo

O `podo360-admin` é o sistema interno da Podo360 para gerenciar a base comercial e administrativa da plataforma.

Ele é separado do `podo360`, que permanece como Sistema Clínica. O Admin não executa fluxo clínico, não edita prontuários, não acessa atendimentos assistenciais e não deve misturar gestão comercial dentro do sistema usado pelas clínicas.

## Módulos do Admin

- Dashboard Admin.
- Leads vindos da Landing Page.
- Empresas contratantes.
- Planos comerciais.
- Extras comerciais.
- Assinaturas e contratos.
- Feature Flags.
- Avisos Globais.
- Auditoria Administrativa.
- Configurações da Plataforma.

## Planos iniciais

| Plano | Mensalidade | Setup | Indicação |
| --- | ---: | ---: | --- |
| Start | R$ 197/mês | R$ 497 | Podólogo individual ou clínica pequena |
| Clinic | R$ 397/mês | R$ 997 | Clínica pequena ou em crescimento |
| Pro | R$ 697/mês | R$ 1.497 | Clínicas com equipe e gestão completa |
| Master | A partir de R$ 997/mês | A partir de R$ 2.497 | Clínicas premium, rede ou white label avançado |

## Extras comerciais

- Usuário adicional: R$ 39/mês.
- Profissional adicional: R$ 59/mês.
- Treinamento extra: R$ 250.
- Personalização de relatório/PDF: R$ 300 a R$ 800.
- Implantação avançada: R$ 1.500 a R$ 3.000.
- White label personalizado fora do Master: R$ 700 a R$ 1.500.

## Integração futura

```text
podo360-landing -> Edge Function/API -> platform_leads -> podo360-admin
podo360-admin -> platform_companies/status/plans/features -> podo360
```

O Sistema Clínica deve consumir somente os dados da própria clínica:

- status da empresa;
- plano ativo;
- features liberadas;
- avisos globais aplicáveis.

O Sistema Clínica não deve:

- listar empresas globais;
- ver leads comerciais;
- editar preços;
- ativar ou suspender outras empresas;
- acessar dados comerciais de outras clínicas.

## Segurança

- Não usar `service_role` no frontend.
- Não expor chaves reais no código.
- Não versionar `.env`.
- Usar RLS forte nas tabelas globais.
- Separar usuários administrativos Podo360 dos usuários das clínicas.
- Não usar `user_metadata` como única fonte confiável de permissão.
- A primeira conta `platform_admin` deve ser criada por processo seguro de bootstrap no banco, após aprovação.

## Banco de dados planejado

A migration correspondente foi preparada no repositório `podo360` como base de plataforma:

- `platform_admin_users`
- `platform_plans`
- `platform_plan_extras`
- `platform_companies`
- `platform_company_subscriptions`
- `platform_company_subscription_extras`
- `platform_features`
- `platform_plan_features`
- `platform_company_feature_overrides`
- `platform_company_status_logs`
- `platform_admin_audit_logs`
- `platform_leads`
- `platform_announcements`
- `platform_announcement_companies`

Nenhuma migration deve ser aplicada no Supabase produção antes da frase explícita:

```text
APROVADO PRODUÇÃO SUPABASE
```

## Fora do escopo nesta fase

- Cobrança automática.
- Gateway de pagamento.
- Emissão automática de boleto ou cartão.
- Bloqueio automático de módulos por plano no sistema clínica.
- Acesso do Admin a prontuários clínicos.
- Deploy de produção sem validação.

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

1. Validar visualmente o Admin em desktop, tablet e mobile.
2. Conectar leitura real do Supabase somente após aplicar migrations aprovadas.
3. Implementar autenticação administrativa.
4. Implementar CRUD real de empresas, planos, extras e contratos.
5. Implementar auditoria administrativa real.
6. Criar Edge Function para receber leads da Landing.
7. Fazer o Sistema Clínica consumir status/plano/features por view ou RPC segura.
