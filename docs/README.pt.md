# Painel de processos (exemplo)

> **Todos os dados deste repositório são DADOS DE EXEMPLO fictícios** (`data/sample-processes.json`). Não são descritos bots, pessoas ou sistemas reais.

Um painel de página única em React + TypeScript (Vite) para processos automatizados: bot responsável, horário, estado, última execução, problema, categoria e detalhes, além de um painel de notas Obsidian. Todos os dados são estáticos no código-fonte; a página não faz chamadas de rede.

## Início rápido
```bash
npm ci && npm start      # compila e serve em http://localhost:4173
```
Requer Node 18+. Servidor de desenvolvimento: `npm run dev`.

## Instalação passo a passo
**Pré-requisitos:** Node.js 18 ou mais recente (com npm) e Git.

```bash
git clone <your-repo-url> ops-dashboard
cd ops-dashboard
npm ci        # instalar as dependências nas versões exatas
npm run dev   # servidor de desenvolvimento com recarga (geralmente http://localhost:5173)
npm test      # executar os testes Vitest
npm run build # verificação de tipos e build em dist/
npm start     # build e servir dist/ em http://localhost:4173
```

Editar os dados de exemplo: processos em `data/sample-processes.json`, projetos em `data/sample-projects.json` (os campos `what`, `why`, `status`, `next` aparecem com **Mais**), excertos do Obsidian em `src/obsidian-adapter.ts`. Nunca faça commit de nomes, e-mails, IPs, registos ou chaves reais.

## Controlos
- Cabeçalho: seletor de idioma (9 idiomas; ◐ = tradução automática parcial), tema (Auto / Claro / Escuro), README.
- As faixas vermelhas e amarelas saltam para o cartão afetado.
- Vistas: relógio de 24 h, rede bots–processos, linhas de metro. Zoom, Ajustar, Ecrã inteiro (Esc).
- Cartões: «Descrição / Comando» com mais / menos.
- Parar / Reiniciar copiam uma mensagem como `Stop: <processo> (Bot A/<id>)` para colar no chat do QR bot. Nada é enviado.

## Porquê o Obsidian / Porquê o leitor do vault
O vault do Obsidian é a base de conhecimento partilhada da equipa: decisões, procedimentos e contexto ficam lá como simples notas Markdown. O leitor do vault acede-lhe apenas em modo de leitura, para que os bots possam pesquisar e usar o que já está escrito em vez de voltar a perguntar. Isto poupa tempo e energia, e o proprietário não precisa de voltar a explicar as coisas.

**Princípio: primeiro a base de conhecimento, depois o proprietário.** Antes de perguntar ao proprietário, um bot pesquisa a base de conhecimento partilhada apenas em leitura e só pergunta se a resposta não estiver lá.

## Configurar o Obsidian
1. Instale o Obsidian (obsidian.md) no computador onde quer ler.
2. Abra o cofre «example vault» (Open folder as vault). O anfitrião do cofre vem da configuração (`vaultHost`).
3. Noutro computador: sincronize a pasta (Syncthing, partilha SMB ou Obsidian Sync) e abra-a com o mesmo nome de cofre.
4. Prima Atualizar no painel do Obsidian.

Ligar o seu próprio vault (apenas marcadores):
- Nome do vault: `<your-vault-name>`
- Máquina: `<host where the vault lives>`
- Modo de sincronização: Obsidian Sync / iCloud / git / local only
- Ligação: defina `VAULT_PATH` num `.env` ignorado pelo git e execute `tools/vault-read`
  `VAULT_PATH=/path/to/<your-vault-name>`

As ligações têm a forma `obsidian://open?vault=<encodeURIComponent(vault)>&file=<encodeURIComponent(caminho sem .md)>` e abrem num novo separador, porque iframes em sandbox bloqueiam protocolos personalizados no mesmo frame.

## Modo de escrita do vault (v1.6.0)

**Interruptor (v1.6.1):** as escritas (`create`, `append`, `--pending`, `approve`) só funcionam com `VAULT_WRITE_ENABLED=1` (env ou `.env`); desativadas por padrão, `pending list` continua só leitura.

`create` cria uma nota nova e falha se já existir; `append` só acrescenta a notas existentes. Sem apagar, sobrescrever ou renomear. `--bot <nome>` é obrigatório; o texto vem de `--text` ou stdin. Cada escrita é registada em `_bot-writes/log.md` (só acréscimo: hora, bot, comando, caminho, primeiros 200 caracteres, sha256) e resumida diariamente em `_bot-writes/daily/YYYY-MM-DD.md`. `--pending` guarda a escrita em `_bot-writes/pending/` sem tocar no destino; só o dono a aplica com `approve <id>`. Exclusões, bloqueio de traversal/symlink e ocultação de segredos valem também para escrita; `.obsidian` e caminhos excluídos nunca são escritos.

```sh
tools/vault-read --json create "Inbox/Note.md" --bot <bot-name> --text "..."
echo "..." | tools/vault-read --json append "Inbox/Note.md" --bot <bot-name>
tools/vault-read --json append "Inbox/Note.md" --bot <bot-name> --pending --text "..."
tools/vault-read --json pending list
tools/vault-read --json approve <id>   # owner only
```

## Adaptador de configuração
`src/obsidian-adapter.ts` contém `OBS_CFG` (`vaultHost`, `vaultName`, `source`) e excertos de exemplo só de leitura. `source` é `local`, `syncthing`, `smb` ou `rest` (URL da Local REST API, apenas marcador). Pode ser substituído com `VITE_OBSIDIAN_HOST`, `VITE_OBSIDIAN_VAULT`, `VITE_OBSIDIAN_SOURCE` num `.env` ignorado pelo git. `src/webhook.ts` é um módulo desativado para controlo direto de processos.

## Guia para principiantes: um processo passo a passo
1. Execute `npm ci && npm start` e abra http://localhost:4173.
2. Em **Vista**, escolha **Rede bots–processos**. No filtro de bots, escolha **QR bot**.
3. Clique na caixa **Análise semanal de tendências**. O cartão de detalhe mostra: horário Monday 10:00, estado ativo · OK, última execução 10-26 10:04.
4. Abra **Descrição / Comando** com **mais** para ler a instrução de exemplo.
5. Prima **Parar**. O texto `Stop: Weekly trend scan (QR bot/p02)` é copiado. Cole-o no seu chat do QR bot; a página em si não envia nada.
6. Mude o idioma no cabeçalho e prima **README** para ler este guia nesse idioma.

## Dados
Substitua `data/sample-processes.json` pela sua própria exportação (mesma estrutura). Nunca faça commit de dados reais ou chaves.

Leitor de cofre Obsidian (somente leitura): `tools/vault-read` — veja o README principal.
