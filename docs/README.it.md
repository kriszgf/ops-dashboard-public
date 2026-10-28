# Dashboard dei processi (esempio)

> **Tutti i dati di questo repository sono DATI DI ESEMPIO inventati** (`data/sample-processes.json`). Non descrivono bot, persone o sistemi reali.
>
> Traduzione automatica, in attesa di revisione da parte di un madrelingua italiano.

Una dashboard a pagina singola in React + TypeScript (Vite) per processi automatizzati: bot responsabile, orario, stato, ultima esecuzione, problema, categoria e dettagli, più un pannello di note Obsidian. Tutti i dati sono statici nel codice sorgente; la pagina non effettua chiamate di rete.

## Avvio rapido
```bash
npm ci && npm start      # compila e serve su http://localhost:4173
```
Richiede Node 18+. Server di sviluppo: `npm run dev`.

## Installazione passo dopo passo

_◐ machine translation, pending review._
**Prerequisiti:** Node.js 18 o successivo (con npm) e Git.

```bash
git clone <your-repo-url> ops-dashboard
cd ops-dashboard
npm ci        # installa le dipendenze nelle versioni esatte
npm run dev   # server di sviluppo con ricarica (di solito http://localhost:5173)
npm test      # esegue i test Vitest
npm run build # controllo dei tipi e build in dist/
npm start     # build, poi serve dist/ su http://localhost:4173
```

Modificare i dati di esempio: processi in `data/sample-processes.json`, progetti in `data/sample-projects.json` (i campi `what`, `why`, `status`, `next` compaiono con **Altro**), estratti Obsidian in `src/obsidian-adapter.ts`. Non fare mai commit di nomi, e-mail, IP, log o chiavi reali.

## Comandi
- Intestazione: selettore della lingua (9 lingue; ◐ = traduzione automatica parziale), tema (Auto / Chiaro / Scuro), README.
- I banner rossi e gialli portano alla scheda interessata.
- Viste: orologio 24 ore, rete bot–processi, linee metro. Zoom, Adatta, Schermo intero (Esc).
- Schede: «Descrizione / Comando» con altro / meno.
- Arresta / Riavvia copiano un messaggio come `Stop: <processo> (Bot A/<id>)` da incollare nella chat del Coordinator. Non viene inviato nulla.

## Perché Obsidian / Perché il lettore del vault
Il vault Obsidian è la base di conoscenza condivisa del team: decisioni, procedure e contesto vi sono raccolti come semplici note Markdown. Il lettore del vault vi accede in sola lettura, così i bot possono cercarvi e usare ciò che è già scritto invece di chiedere di nuovo. Si risparmiano tempo ed energia, e il proprietario non deve rispiegare le cose.

**Principio: prima la base di conoscenza, poi il proprietario.** Prima di chiedere al proprietario, un bot cerca nella base di conoscenza condivisa in sola lettura e chiede solo se la risposta non c'è.

## Configurare Obsidian
1. Installa Obsidian (obsidian.md) sul computer dove vuoi leggere.
2. Apri il vault «example vault» (Open folder as vault). L’host del vault viene dalla configurazione (`vaultHost`).
3. Su un altro computer: sincronizza la cartella (Syncthing, condivisione SMB o Obsidian Sync) e aprila con lo stesso nome di vault.
4. Premi Aggiorna nel pannello Obsidian.

Collegare il proprio vault (solo segnaposto):
- Nome del vault: `<your-vault-name>`
- Macchina: `<host where the vault lives>`
- Modalità di sincronizzazione: Obsidian Sync / iCloud / git / local only
- Collegamento: imposta `VAULT_PATH` in un `.env` ignorato da git, poi esegui `tools/vault-read`
  `VAULT_PATH=/path/to/<your-vault-name>`

I link hanno la forma `obsidian://open?vault=<encodeURIComponent(vault)>&file=<encodeURIComponent(percorso senza .md)>` e si aprono in una nuova scheda, perché gli iframe in sandbox bloccano i protocolli personalizzati nello stesso frame.

## Modalità scrittura del vault (v1.6.0)

**Interruttore (v1.6.1):** le scritture (`create`, `append`, `--pending`, `approve`) funzionano solo con `VAULT_WRITE_ENABLED=1` (env o `.env`); disattivate di default, `pending list` resta in sola lettura.

`create` crea una nuova nota e fallisce se esiste già; `append` aggiunge solo a note esistenti. Niente eliminazione, sovrascrittura o rinomina. `--bot <nome>` è obbligatorio; il testo arriva da `--text` o stdin. Ogni scrittura è registrata in `_bot-writes/log.md` (solo aggiunta: ora, bot, comando, percorso, primi 200 caratteri, sha256) e riassunta ogni giorno in `_bot-writes/daily/YYYY-MM-DD.md`. `--pending` salva la scrittura in `_bot-writes/pending/` senza toccare il file; solo il proprietario la applica con `approve <id>`. Esclusioni, blocco traversal/symlink e oscuramento dei segreti valgono anche in scrittura; `.obsidian` e i percorsi esclusi non vengono mai scritti.

```sh
tools/vault-read --json create "Inbox/Note.md" --bot <bot-name> --text "..."
echo "..." | tools/vault-read --json append "Inbox/Note.md" --bot <bot-name>
tools/vault-read --json append "Inbox/Note.md" --bot <bot-name> --pending --text "..."
tools/vault-read --json pending list
tools/vault-read --json approve <id>   # owner only
```

## Adattatore di configurazione
`src/obsidian-adapter.ts` contiene `OBS_CFG` (`vaultHost`, `vaultName`, `source`) ed estratti di esempio di sola lettura. `source` è `local`, `syncthing`, `smb` o `rest` (URL della Local REST API, solo segnaposto). Si può sovrascrivere con `VITE_OBSIDIAN_HOST`, `VITE_OBSIDIAN_VAULT`, `VITE_OBSIDIAN_SOURCE` in un `.env` ignorato da git. `src/webhook.ts` è uno stub disattivato per il controllo diretto dei processi.

## Guida per principianti: un processo passo dopo passo
1. Esegui `npm ci && npm start` e apri http://localhost:4173.
2. In **Vista** scegli **Rete bot–processi**. Nel filtro dei bot scegli **Coordinator**.
3. Fai clic sul riquadro **Weekly trend scan** (in italiano i nomi dei processi restano in inglese). La scheda di dettaglio mostra: orario Monday 10:00, stato attivo · OK, ultima esecuzione 10-26 10:04.
4. Apri **Descrizione / Comando** con **altro** per leggere l’istruzione di esempio.
5. Premi **Arresta**. Viene copiato il testo `Stop: Weekly trend scan (Coordinator/p02)`. Incollalo nella chat del Coordinator; la pagina non invia nulla.
6. Cambia lingua nell’intestazione e premi **README** per leggere questa guida in quella lingua.

## Dati
Sostituisci `data/sample-processes.json` con la tua esportazione (stessa struttura). Non fare mai commit di dati reali o chiavi.

Lettore del vault Obsidian (sola lettura): `tools/vault-read` — vedi README principale.
