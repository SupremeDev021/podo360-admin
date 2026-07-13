# Configuracao de Dominio - Podo360 Admin Global

Data: 13/07/2026

Dominio planejado:

- `podoadmin360.supremetech.com`

## Estado Atual

- O build local do Admin Global passou.
- O deploy atual em GitHub Pages deve ser preservado ate o cutover.
- Nenhum arquivo `CNAME` foi adicionado nesta rodada para nao alterar o dominio publicado antes da preparacao de DNS.

## DNS

Criar um registro CNAME:

- Nome: `podoadmin360`
- Destino: `supremedev021.github.io`

Depois que o DNS propagar, configurar o dominio customizado nas configuracoes de Pages do repositorio `SupremeDev021/podo360-admin`.

## Build e Router

Para dominio customizado na raiz, o build deve usar base `/`.

Se o workflow atual estiver usando base de subpasta do GitHub Pages, ajustar apenas no momento do cutover. Antes disso, manter o deploy atual:

- `https://supremedev021.github.io/podo360-admin/#/admin/login`

## Supabase Auth

Adicionar em Authentication > URL Configuration:

- Redirect URL: `https://podoadmin360.supremetech.com/*`

Manter durante a transicao:

- `https://supremedev021.github.io/podo360-admin/*`
- `http://localhost:5173/*`

## Checklist Antes do Cutover

- Login owner/Admin Global aprovado no dominio final.
- Usuario clinico comum bloqueado.
- Dashboard, Empresas, Planos, Assinaturas, Leads, Avisos e Auditoria aprovados.
- Criacao/edicao de aviso aprovada.
- Limite de usuarios por clinica aprovado.
- Console sem erro critico.
- Nenhuma credencial versionada.
