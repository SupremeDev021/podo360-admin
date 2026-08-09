# Domínio de produção do Admin

## Destino definitivo

- Domínio: `podoadmin360.supremetechdev.com`
- Hospedagem: GitHub Pages do repositório `SupremeDev021/podo360-admin`
- Origem DNS esperada: CNAME `podoadmin360` para `supremedev021.github.io`
- Proxy inicial: DNS only

O build usa caminhos relativos para funcionar no domínio customizado e no endereço de contingência `https://supremedev021.github.io/podo360-admin/`.

## Ordem operacional

1. Remover o registro ligado ao Cloudflare Tunnel perdido.
2. Criar o CNAME em modo DNS only.
3. Confirmar que o DNS resolve para o GitHub Pages.
4. Configurar `podoadmin360.supremetechdev.com` em Settings > Pages.
5. Aguardar o certificado e habilitar Enforce HTTPS.
6. Confirmar `/healthcheck.json`, login e páginas administrativas.
7. Atualizar `HEALTHCHECK_ADMIN_URL` para o domínio definitivo.

Não reativar dependência de servidor local, Tailscale, Nginx local ou Tunnel.
