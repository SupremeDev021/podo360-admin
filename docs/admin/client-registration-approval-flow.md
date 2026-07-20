# Fluxo de cadastro publico de clientes

O Podo360 Admin passou a receber solicitacoes enviadas pelo app separado `cadastro-cliente`.

## Onde acessar

Menu do Admin Global:

`Solicitacoes de Cadastro`

## Status

- `pending`: recebido e aguardando analise.
- `in_review`: em analise pela equipe.
- `approved`: aprovado, mas ainda nao convertido.
- `rejected`: reprovado.
- `need_more_info`: precisa de ajuste ou contato adicional.
- `converted`: convertido em clinica.

## Conversao em clinica

Ao converter uma solicitacao, o Admin Global confirma:

- status inicial da clinica;
- plano;
- limite de usuarios;
- nome e e-mail do admin da clinica.

O sistema cria os registros comerciais e clinicos necessarios e pode enviar convite seguro para o admin da clinica.

## Seguranca

O formulario publico apenas insere solicitacoes. A listagem e aprovacao ficam restritas ao Admin Global ativo.
