# Folyamat-dashboard (példa)

> **A repóban minden adat kitalált PÉLDAADAT** (`data/sample-processes.json`). Valódi botokat, személyeket vagy rendszereket nem ír le.

Egyoldalas React + TypeScript (Vite) dashboard automatizált folyamatokhoz: gazda bot, ütemezés, állapot, utolsó futás, probléma, kategória és részletek, plusz Obsidian-jegyzetpanel. Minden adat statikusan a forrásban van; az oldal nem indít hálózati hívást.

## Gyors indítás
```bash
npm ci && npm start      # build, majd kiszolgálás: http://localhost:4173
```
Node 18+ szükséges. Fejlesztői szerver: `npm run dev`.

## Telepítési útmutató lépésről lépésre
**Követelmények**
- Node 20 vagy újabb (`node -v`).
- Egy Mac (pl. egy Mac mini) vagy bármilyen más gép (Linux, Windows).
- Obsidian: opcionális, csak a jegyzetlinkekhez kell.

**Telepítés és indítás**
1. Klónozd vagy töltsd le a repót, és lépj be a mappájába.
2. Futtasd: `npm ci && npm start`.
3. Nyisd meg a böngészőben: http://localhost:4173.

**Az Obsidian vault beállítása**
1. Másold le a mintát: `cp .env.example .env` (a `.env` nem kerül a gitbe).
2. Írd be a saját értékeidet, például:
   ```
   VITE_OBSIDIAN_VAULT=Sajat Vault
   VITE_OBSIDIAN_HOST=Otthoni gep
   VITE_OBSIDIAN_SOURCE=local
   ```
   A `VITE_OBSIDIAN_SOURCE` lehet `local`, `syncthing`, `smb` vagy `rest`. Az alapértékek a `src/obsidian-adapter.ts` fájlban vannak (`OBS_CFG`), ott is átírhatod őket.
3. Indítsd újra: `npm start` (a build beolvassa az új értékeket).

**A dashboard megnyitása**
- (a) Grok/Cursor Page-ként: a dashboard Page-ként is megnyitható a Grok/Cursor felületén. Ehhez Cursor-bejelentkezés kell.
- (b) Önállóan, Grok nélkül: ugyanazon a gépen bármilyen böngészőben nyisd meg a http://localhost:4173 címet. Bejelentkezés nem kell, és az oldal nem indít hálózati hívást.

## Kezelőelemek
- Fejléc: nyelvválasztó (9 nyelv; ◐ = részleges gépi fordítás), téma (Auto / Világos / Sötét), README.
- A piros és sárga sávok az érintett kártyára ugranak.
- Nézetek: 24 órás óra, bot–folyamat hálózat, metróvonalak. Nagyítás, Igazítás, Teljes képernyő (Esc).
- Kártyák: „Leírás / Parancs” több / kevesebb kapcsolóval.
- A Leállítás / Újraindítás üzenetet másol, pl. `Állítsd le: <folyamat> (Bot A/<id>)`, a QR bot chatbe illesztéshez. Semmit nem küld el.

## Miért Obsidian / Miért a vault-olvasó
Az Obsidian-vault a csapat közös tudásbázisa: a döntések, eljárások és háttérinformációk egyszerű Markdown-jegyzetekként élnek benne. A vault-olvasó csak olvasva éri el, így a botok kereshetnek benne, és újrakérdezés helyett a már leírt tudást használják. Ez időt és energiát spórol, a tulajdonosnak pedig nem kell újra elmagyaráznia a dolgokat.

**Elv: először a tudásbázis, utána a tulajdonos.** Mielőtt a tulajdonoshoz fordulna, a bot csak olvasva átkeresi a közös tudásbázist, és csak akkor kérdez, ha ott nincs meg a válasz.

## Obsidian beállítása
1. Telepítsd az Obsidiant (obsidian.md) azon a gépen, ahol olvasni szeretnél.
2. Nyisd meg az „example vault” vaultot (Open folder as vault). A vault gépe a konfigurációból jön (`vaultHost`).
3. Másik gépen: szinkronizáld a mappát (Syncthing, SMB-megosztás vagy Obsidian Sync), és ugyanezzel a vaultnévvel nyisd meg.
4. Nyomd meg a Frissítés gombot az Obsidian panelen.

Saját vault csatlakoztatása (csak helyőrzők):
- Vault neve: `<your-vault-name>`
- Gép: `<host where the vault lives>`
- Szinkronizálás módja: Obsidian Sync / iCloud / git / local only
- Csatlakoztatás: állítsd be a `VAULT_PATH` értékét egy git által figyelmen kívül hagyott `.env` fájlban, majd futtasd a `tools/vault-read` parancsot
  `VAULT_PATH=/path/to/<your-vault-name>`

A linkek formátuma `obsidian://open?vault=<encodeURIComponent(vault)>&file=<encodeURIComponent(útvonal .md nélkül)>`. Új lapon nyílnak, mert a sandboxolt iframe ugyanabban a keretben tiltja az egyedi protokollt.

## Vault írási mód (v1.6.0)

**Vészkapcsoló (v1.6.1):** az írás (`create`, `append`, `--pending`, `approve`) csak `VAULT_WRITE_ENABLED=1` mellett működik (env vagy `.env`); alapból ki van kapcsolva, a `pending list` csak olvas.

A `create` új jegyzetet hoz létre, és hibát ad, ha már létezik; az `append` csak meglévő jegyzethez fűz hozzá. Törlés, felülírás, átnevezés nincs. A `--bot <név>` kötelező; a szöveg a `--text` kapcsolóból vagy stdinből jön. Minden írás bekerül a `_bot-writes/log.md` naplóba (csak hozzáfűzés: idő, bot, parancs, útvonal, első 200 karakter, sha256), napi összesítő: `_bot-writes/daily/YYYY-MM-DD.md`. A `--pending` a `_bot-writes/pending/` mappába teszi az írást, a célfájlt nem érinti; élesíteni csak a tulajdonos tudja az `approve <id>` paranccsal. A kizárási lista, a traversal/symlink tiltás és a titkok kitakarása az írásra is érvényes; a `.obsidian` és a kizárt útvonalak sosem íródnak.

```sh
tools/vault-read --json create "Inbox/Note.md" --bot <bot-name> --text "..."
echo "..." | tools/vault-read --json append "Inbox/Note.md" --bot <bot-name>
tools/vault-read --json append "Inbox/Note.md" --bot <bot-name> --pending --text "..."
tools/vault-read --json pending list
tools/vault-read --json approve <id>   # owner only
```

## Konfigurációs adapter
A `src/obsidian-adapter.ts` tartalmazza az `OBS_CFG`-t (`vaultHost`, `vaultName`, `source`) és a csak olvasható mintakivonatokat. A `source` értéke `local`, `syncthing`, `smb` vagy `rest` (Local REST API URL, egyelőre csak helyőrző). Felülírható a `VITE_OBSIDIAN_HOST`, `VITE_OBSIDIAN_VAULT`, `VITE_OBSIDIAN_SOURCE` változókkal egy gitből kizárt `.env` fájlban. A `src/webhook.ts` kikapcsolt csonk a közvetlen folyamatvezérléshez.

## Kezdő útmutató: egy folyamat lépésről lépésre
1. Futtasd: `npm ci && npm start`, majd nyisd meg: http://localhost:4173.
2. A **Nézet** alatt válaszd a **Bot–folyamat hálózat** nézetet. A botszűrőben válaszd a **QR bot** botot.
3. Kattints a **Heti trendgyűjtés** dobozra. A részletkártya mutatja: ütemezés Monday 10:00, állapot aktív · OK, utolsó futás 10-26 10:04.
4. Nyisd ki a **Leírás / Parancs** részt a **több** gombbal, és olvasd el a mintautasítást.
5. Nyomd meg a **Leállítás** gombot. A vágólapra kerül: `Állítsd le: Heti trendgyűjtés (QR bot/p02)`. Illeszd be a QR bot chatbe; az oldal maga semmit nem küld.
6. Válts nyelvet a fejlécben, és a **README** gombbal olvasd el ezt az útmutatót azon a nyelven.

## Adatok
Cseréld le a `data/sample-processes.json` fájlt a saját exportodra (azonos szerkezet). Valódi adatot vagy kulcsot soha ne commitolj.

Obsidian-vault olvasó (csak olvasás): `tools/vault-read` — lásd a fő README-t.
