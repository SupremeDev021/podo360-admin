# Readiness do Admin Global

Data: 20/07/2026

## Estado atual

O Admin Global possui autenticacao real, permissao por `platform_admin_users` e telas administrativas conectadas ao banco oficial Podo360.

## Novidade desta rodada

Foi adicionado o fluxo `Solicitacoes de Cadastro`, integrado ao novo app publico `cadastro-cliente`.

O Admin pode:

- listar cadastros enviados pelo formulario publico;
- filtrar visualmente por status;
- analisar solicitacao;
- salvar observacao interna;
- aprovar, reprovar ou marcar como precisa de ajuste;
- converter a solicitacao em clinica;
- definir plano, status e limite de usuarios;
- convidar o admin principal da clinica.

## Seguranca

- O formulario publico nao lista dados.
- Apenas Admin Global ativo pode analisar solicitacoes.
- Usuario de clinica comum nao deve acessar este fluxo.
- Conversoes ficam auditadas.
- O frontend nao usa `service_role`.

## Pendencia operacional

O dominio customizado do Admin precisa receber um build com variaveis de producao ou ser apontado para o GitHub Pages funcional. A tentativa de SSH no servidor Tailscale `100.84.50.104` falhou por timeout.
