# Relatorio Final do Admin Global - Podo360

Data: 13/07/2026

## Atualizacao desta rodada

- Mensagens tecnicas visiveis citando Supabase/RLS/tabelas internas foram substituidas por linguagem profissional.
- Typecheck: aprovado.
- Build: aprovado.
- O E2E do Admin integrado no repo clinico validou bloqueio sem sessao, bloqueio de credenciais invalidas e bloqueio de usuario clinico comum.
- O login automatizado do owner no Admin separado nao foi repetido nesta rodada porque as variaveis locais `PLAYWRIGHT_PLATFORM_ADMIN_EMAIL` e `PLAYWRIGHT_PLATFORM_ADMIN_PASSWORD` nao estao configuradas no ambiente atual.

## Status

Admin Global funcionando e publicado no GitHub Pages, mas a liberacao final conjunta com o Podo360 clinico ainda depende da nova rodada E2E autenticada do sistema clinico apos corrigir as credenciais do Usuario B.

## Correcoes desta rodada

- Removida a rota publica temporaria `/admin/setup`.
- Removido o botao "Setup do primeiro Admin Global" da tela de login.
- Removido o componente publico que montava SQL de vinculacao administrativa.
- Atualizado o README para registrar que novos administradores devem ser criados por fluxo operacional controlado no Supabase/Auth e vinculados em `platform_admin_users`.

## Validacoes

- Typecheck: aprovado.
- Build: aprovado.
- GitHub Actions Pages: validado anteriormente com secrets reais sem exposicao de valores.
- Bundle publicado: validado anteriormente com `VITE_SUPABASE_URL` correto, chave publica em formato publishable e sem dados mockados.

## Seguranca

- Nenhuma senha foi adicionada ao codigo.
- Nenhum `.env`, `.env.local` ou `.env.test.local` foi versionado.
- Nenhuma chave secreta ou `service_role` foi adicionada ao frontend.
- A criacao publica de Admin Global foi removida depois da criacao do owner.

## Pendencias

- Rerodar fluxo completo autenticado do Podo360 clinico apos corrigir Usuario B.
- Validar novamente o Admin publicado apos novo deploy da remocao do setup publico.

## Correcao do Convite de Admin da Clinica - 14/07/2026

Problema corrigido:

- O formulario de criacao de admin da clinica pedia senha temporaria e podia deixar a operacao com feedback travado quando a chamada falhava.

Correcao:

- O formulario agora convida o admin da clinica por e-mail, sem senha temporaria no Admin Global.
- O botao informa "Enviando convite..." durante a operacao e sempre libera o estado no `finally`.
- A limpeza do formulario foi protegida para evitar falha de `reset()` apos operacao assincrona.
- O convite usa a Edge Function `admin-create-company-user`, publicada com redirect de producao para `https://podo360.supremetechdev.com/`.

Validacoes:

- Typecheck: aprovado.
- Build: aprovado.

Pendencia operacional:

- Reenviar convites antigos gerados antes da correcao.
- Confirmar no painel Auth que os dominios finais estao listados nas Redirect URLs.

## Cadastro publico de clientes - 20/07/2026

Implementado novo fluxo sem substituir telas existentes do Admin Global.

Entregas:

- Criada tabela `platform_client_registration_requests` para receber cadastros publicos.
- RLS aplicada: usuario anonimo apenas insere; nao lista, nao atualiza e nao apaga.
- Admin Global ativo pode listar e atualizar solicitacoes.
- Adicionada tela `Solicitacoes de Cadastro` no menu do Admin.
- A tela permite analisar solicitacoes, alterar status, salvar observacao interna e converter cadastro em clinica.
- Conversao cria `companies`, `company_settings`, `platform_companies` e `platform_company_subscriptions`.
- Conversao permite definir plano, status inicial, limite de usuarios e convidar o admin da clinica.
- Auditoria registrada em `platform_admin_audit_logs`.

Correcao estrutural incluida:

- Adicionada coluna `max_users` em `platform_company_subscriptions`, usada pelo limite de usuarios da clinica.
- Adicionadas policies restritas para Admin Global criar/atualizar `companies` e `company_settings` durante conversao.

Validacoes:

- Typecheck do Admin: aprovado.
- Build do Admin: aprovado.
- Teste transacional com rollback confirmou que `anon` consegue inserir solicitacao, mas nao consegue listar.
- Teste transacional com rollback confirmou que Admin Global consegue criar os registros principais de conversao.

Erro atual de conexao no dominio customizado:

- Causa encontrada: o bundle servido em `https://podoadmin360.supremetechdev.com/` foi gerado sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- GitHub Pages estava correto, com secrets configurados.
- Tentativa de envio do build corrigido para o servidor via Tailscale falhou por timeout no SSH em `100.84.50.104`.
- Pendencia operacional: restabelecer SSH/Tailscale do servidor e publicar novamente o build do Admin no Nginx, ou apontar o dominio para o deploy GitHub Pages funcional.

Atualizacao operacional:

- SSH local em `192.168.1.94` funcionou com o usuario `supremetech`.
- O root real do Admin foi identificado em `/home/supremetech/podo360-sites/admin`.
- Backup criado em `/home/supremetech/podo360-sites/admin.backup.20260720-admin-before-env-fix`.
- Novo build de producao publicado no root do Admin.
- Dominio `https://podoadmin360.supremetechdev.com/` validado carregando o bundle novo com variaveis publicas corretas.
- Bundle publicado contem `Solicitacoes de Cadastro` e nao contem link publico de setup.
