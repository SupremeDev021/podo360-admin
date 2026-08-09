# Readiness do Admin Global

Data: 09/08/2026

## Estado

O Admin usa autenticacao real, autorizacao por `platform_admin_users` e dados do
ambiente oficial. O dominio final e servido pelo GitHub Pages com HTTPS:

`https://podoadmin360.supremetechdev.com`

Nao existe dependencia de servidor local, Nginx, Tailscale ou Tunnel.

## Solicitacoes de Cadastro

O fluxo integrado permite:

- listar e filtrar solicitacoes;
- salvar observacao interna e alterar status;
- aprovar, rejeitar ou solicitar ajustes;
- converter a solicitacao em clinica;
- definir plano, status e limite de usuarios;
- gerar, reenviar e cancelar o acesso do cliente;
- registrar auditoria.

## Seguranca

- O formulario publico nao lista dados.
- Apenas Admin Global ativo analisa solicitacoes.
- Usuario clinico comum nao acessa o Admin.
- O frontend nao usa `service_role`.
- Empresa, papel e limite sao validados no fluxo seguro, nao escolhidos pelo
  cliente no navegador.

## Validacao operacional

Em 09/08/2026, login owner, Dashboard, Leads, Empresas, Planos, Extras,
Assinaturas, Feature Flags, Avisos, Auditoria, Configuracoes e logout passaram
no dominio final sem erro de pagina. A tela de Solicitacoes de Cadastro foi
encontrada em branch anterior nao integrada e incorporada para novo deploy.
