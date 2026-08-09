# Criacao de Admin da Clinica pelo Admin Global

Data: 14/07/2026

## Objetivo

Permitir que owner/admin global convide o primeiro administrador de uma clinica sem senha versionada, sem `service_role` no frontend e sem formulario travado.

## Correcao Aplicada

- O formulario de "Criar admin da clinica" foi ajustado para enviar convite por e-mail.
- O campo de senha temporaria foi removido do fluxo do Admin Global.
- O botao passou a exibir estado claro de envio:
  - "Enviando convite..."
- A limpeza do formulario passou a ocorrer somente quando o elemento ainda esta conectado, evitando falha de `reset()` apos chamada assincrona.
- Em caso de erro, o estado de salvamento sempre e liberado no `finally`.

## Resultado Esperado

Ao convidar um admin da clinica:

- o usuario Auth e criado/convidado pelo backend seguro;
- o profile e vinculado a `company_id` da clinica;
- a role e `company_admin`;
- o usuario nao vira Admin Global;
- o convite usa o dominio de producao da Clinica:
  - `https://podo360.supremetechdev.com/`

## Validacoes

- Typecheck do Admin Global: aprovado.
- Build do Admin Global: aprovado.
- A Edge Function compartilhada `admin-create-company-user` foi publicada no projeto oficial.

## Observacao

Convites antigos que apontavam para `localhost` precisam ser reenviados pelo novo fluxo.
