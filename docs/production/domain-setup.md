# Configuracao de Dominio - Podo360 Admin Global

Data: 13/07/2026

Dominio planejado:

- `podoadmin360.supremetech.com`

## Estado Atual

- O build local do Admin Global passou.
- O deploy atual em GitHub Pages deve ser preservado ate o cutover.
- Nenhum arquivo `CNAME` foi adicionado nesta rodada para nao alterar o dominio publicado antes da preparacao de DNS.

## Deploy custom domain - 20/07/2026

Dominio validado:

`https://podoadmin360.supremetechdev.com/`

Causa do erro corrigido:

- O dominio customizado estava servindo um bundle antigo gerado sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- O build foi refeito com a URL publica do projeto Podo360 e chave anon/publishable.
- Nenhuma chave secreta foi usada no frontend.

Servidor:

- SSH: `supremetech@192.168.1.94`.
- Root real: `/home/supremetech/podo360-sites/admin`.
- Container estatico: `podo360-admin-web`.
- Proxy: Nginx Proxy Manager / Cloudflare.

Backup criado:

- `/home/supremetech/podo360-sites/admin.backup.20260720-admin-before-env-fix`.

Validacao:

- O HTML publico carrega `assets/index-B5Xnk9lL.js`.
- O bundle contem a URL publica do projeto e chave publishable.
- A tela temporaria de setup nao aparece no HTML.
- A tela `Solicitacoes de Cadastro` esta presente no bundle publicado.

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
