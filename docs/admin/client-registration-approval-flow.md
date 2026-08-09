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

O sistema cria os registros comerciais e clinicos necessarios e gera um link seguro para o cliente definir a propria senha.

O catalogo comercial (`platform_plans`) e diferente do catalogo clinico (`plans`). A conversao relaciona o plano clinico apenas quando existe o mesmo `slug`; o plano e o limite contratados permanecem na assinatura comercial.

Depois da conversao, use **Acesso do cliente** para gerar, copiar, reenviar ou cancelar o link e acompanhar seu estado.

Consulte `docs/admin/client-access-invite-flow.md`.

## Seguranca

O formulario publico apenas insere solicitacoes. A listagem e aprovacao ficam restritas ao Admin Global ativo.
