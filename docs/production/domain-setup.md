# Dominio de producao do Admin

## Estado atual

- Dominio: `https://podoadmin360.supremetechdev.com`
- Hospedagem: GitHub Pages do repositorio `SupremeDev021/podo360-admin`
- DNS: CNAME `podoadmin360` para `supremedev021.github.io`
- Proxy Cloudflare: DNS only
- HTTPS: obrigatorio no GitHub Pages
- Healthcheck: `/healthcheck.json`

O registro antigo do Cloudflare Tunnel foi substituido em 09/08/2026. O Admin
nao depende de servidor local, Tailscale, Nginx local ou Tunnel.

## Build e fallback

O build usa caminhos relativos e preserva a URL do GitHub Pages durante a
transicao:

`https://supremedev021.github.io/podo360-admin/`

O artefato de deploy inclui `public/CNAME` com o dominio definitivo.

## Supabase Auth

As URLs permitidas devem incluir:

- `https://podoadmin360.supremetechdev.com/*`
- `https://podo360.supremetechdev.com/*`
- `https://cadastro.podo360.supremetechdev.com/*`
- `https://supremedev021.github.io/podo360-admin/*`
- `http://localhost:5173/*` somente para desenvolvimento

## Validacao

- Login de Admin Global no dominio final.
- Usuario clinico comum bloqueado.
- Dashboard, Empresas, Planos, Assinaturas, Solicitacoes de Cadastro, Leads,
  Avisos, Auditoria e Configuracoes carregados.
- Nenhum segredo ou chave administrativa no frontend.
