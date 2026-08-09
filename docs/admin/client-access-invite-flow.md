# Convite de primeiro acesso do cliente

## Gerar acesso

1. Abra **Solicitacoes de Cadastro**.
2. Analise a solicitacao.
3. Em **Converter em clinica**, selecione plano, status e limite.
4. Confirme nome e e-mail do administrador da clinica.
5. Converta a solicitacao.
6. Em **Acesso do cliente**, copie o link e envie pelo canal autorizado.

Somente `owner` e `admin` podem gerar, reenviar ou cancelar links.

## Estados

- **Pendente:** ainda pode ser usado.
- **Criando acesso:** conclusao em andamento.
- **Usado:** a conta ja foi criada.
- **Expirado:** gere um novo link.
- **Cancelado:** o link nao pode mais ser usado.

O token completo aparece apenas no retorno da geracao. O banco guarda somente seu hash.

## Reenviar e cancelar

**Gerar novo link** cancela o convite pendente anterior e cria outro com validade de 72 horas. Se o e-mail ja possui acesso, oriente o cliente a entrar no Podo360 Clinica.

Use **Cancelar convite** somente enquanto o status estiver pendente ou em processamento. A operacao e registrada na auditoria.

## Seguranca

- nenhuma senha e criada pelo Admin;
- empresa e papel nao sao enviados pelo formulario publico;
- `company_id` e `role = company_admin` vem do convite validado;
- limite de usuarios e conferido antes da criacao;
- usuario clinico nunca recebe registro em `platform_admin_users`.
