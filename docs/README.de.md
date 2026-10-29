# Prozess-Dashboard (Beispiel)

> **Alle Daten in diesem Repository sind erfundene BEISPIELDATEN** (`data/sample-processes.json`). Es werden keine echten Bots, Personen oder Systeme beschrieben.

Ein einseitiges React- + TypeScript-Dashboard (Vite) für automatisierte Prozesse: verantwortlicher Bot, Zeitplan, Status, letzter Lauf, Problem, Kategorie und Details, dazu ein Obsidian-Notizpanel. Alle Daten liegen statisch im Quelltext; die Seite macht keine Netzwerkaufrufe.

## Schnellstart
```bash
npm ci && npm start      # baut und startet den Server auf http://localhost:4173
```
Benötigt Node 18+. Entwicklungsserver: `npm run dev`.

## Installation Schritt für Schritt
**Voraussetzungen:** Node.js 18 oder neuer (mit npm) und Git.

```bash
git clone <your-repo-url> ops-dashboard
cd ops-dashboard
npm ci        # Abhängigkeiten in exakten Versionen installieren
npm run dev   # Entwicklungsserver mit Hot Reload (meist http://localhost:5173)
npm test      # Vitest-Tests ausführen
npm run build # Typprüfung und Build nach dist/
npm start     # Build, dann dist/ auf http://localhost:4173 ausliefern
```

Beispieldaten bearbeiten: Prozesse in `data/sample-processes.json`, Projekte in `data/sample-projects.json` (Felder `what`, `why`, `status`, `next` erscheinen nach **Mehr**), Obsidian-Auszüge in `src/obsidian-adapter.ts`. Niemals echte Namen, E-Mails, IPs, Logs oder Schlüssel committen.

## Bedienelemente
- Kopfzeile: Sprachauswahl (9 Sprachen; ◐ = teilweise maschinelle Übersetzung), Design (Auto / Hell / Dunkel), README.
- Rote und gelbe Banner springen zur betroffenen Karte.
- Ansichten: 24-Stunden-Uhr, Bot-Prozess-Netz, Metrolinien. Zoom, Einpassen, Vollbild (Esc).
- Karten: „Beschreibung / Befehl“ mit mehr / weniger.
- Stoppen / Neu starten kopieren eine Nachricht wie `Stop: <Prozess> (Bot A/<id>)` zum Einfügen in den QR bot-Chat. Es wird nichts gesendet.

## Warum Obsidian / Warum der Vault-Reader
Der Obsidian-Vault ist die gemeinsame Wissensbasis des Teams: Entscheidungen, Abläufe und Kontext liegen dort als einfache Markdown-Notizen. Der Vault-Reader greift nur lesend darauf zu, sodass Bots darin suchen und bereits Aufgeschriebenes nutzen können, statt erneut zu fragen. Das spart Zeit und Energie, und der Eigentümer muss nichts noch einmal erklären.

**Prinzip: erst die Wissensbasis, dann den Eigentümer fragen.** Bevor ein Bot den Eigentümer fragt, durchsucht er die gemeinsame Wissensbasis nur lesend und fragt nur, wenn die Antwort dort fehlt.

## Obsidian einrichten
1. Installiere Obsidian (obsidian.md) auf dem Gerät, auf dem du lesen willst.
2. Öffne den Vault „example vault“ (Open folder as vault). Der Vault-Host kommt aus der Konfiguration (`vaultHost`).
3. Auf einem anderen Gerät: synchronisiere den Ordner (Syncthing, SMB-Freigabe oder Obsidian Sync) und öffne ihn mit demselben Vault-Namen.
4. Drücke im Obsidian-Panel auf Aktualisieren.

Eigenen Vault verbinden (nur Platzhalter):
- Vault-Name: `<your-vault-name>`
- Rechner: `<host where the vault lives>`
- Sync-Modus: Obsidian Sync / iCloud / git / local only
- Verbinden: `VAULT_PATH` in einer von git ignorierten `.env` setzen, dann `tools/vault-read` ausführen
  `VAULT_PATH=/path/to/<your-vault-name>`

Links haben die Form `obsidian://open?vault=<encodeURIComponent(vault)>&file=<encodeURIComponent(Pfad ohne .md)>` und öffnen sich in einem neuen Tab, weil Sandbox-iframes eigene Protokolle im selben Frame blockieren.

## Schreibmodus für den Vault (v1.6.0)

**Not-Aus (v1.6.1):** Schreibbefehle (`create`, `append`, `--pending`, `approve`) laufen nur mit `VAULT_WRITE_ENABLED=1` (env oder `.env`); standardmäßig aus, `pending list` bleibt nur lesend.

`create` legt eine neue Notiz an und schlägt fehl, wenn sie existiert; `append` hängt nur an bestehende Notizen an. Kein Löschen, Überschreiben oder Umbenennen. `--bot <name>` ist Pflicht; Text kommt aus `--text` oder stdin. Jeder Schreibvorgang wird in `_bot-writes/log.md` protokolliert (nur anhängend: Zeit, Bot, Befehl, Pfad, erste 200 Zeichen, sha256), täglich zusammengefasst in `_bot-writes/daily/YYYY-MM-DD.md`. `--pending` legt den Vorgang in `_bot-writes/pending/` ab, ohne das Ziel zu ändern; nur der Eigentümer wendet ihn mit `approve <id>` an. Ausschlussliste, Traversal-/Symlink-Sperre und Schwärzung von Geheimnissen gelten auch beim Schreiben; `.obsidian` und ausgeschlossene Pfade werden nie beschrieben.

```sh
tools/vault-read --json create "Inbox/Note.md" --bot <bot-name> --text "..."
echo "..." | tools/vault-read --json append "Inbox/Note.md" --bot <bot-name>
tools/vault-read --json append "Inbox/Note.md" --bot <bot-name> --pending --text "..."
tools/vault-read --json pending list
tools/vault-read --json approve <id>   # owner only
```

## Konfigurationsadapter
`src/obsidian-adapter.ts` enthält `OBS_CFG` (`vaultHost`, `vaultName`, `source`) und schreibgeschützte Beispielauszüge. `source` ist `local`, `syncthing`, `smb` oder `rest` (Local-REST-API-URL, nur Platzhalter). Überschreibbar mit `VITE_OBSIDIAN_HOST`, `VITE_OBSIDIAN_VAULT`, `VITE_OBSIDIAN_SOURCE` in einer von Git ignorierten `.env`. `src/webhook.ts` ist ein deaktivierter Platzhalter für direkte Prozesssteuerung.

## Einsteigeranleitung: ein Prozess Schritt für Schritt
1. Führe `npm ci && npm start` aus und öffne http://localhost:4173.
2. Wähle unter **Ansicht** das **Bot-Prozess-Netz**. Wähle im Bot-Filter **QR bot**.
3. Klicke auf das Feld **Wöchentlicher Trend-Scan**. Die Detailkarte zeigt: Zeitplan Monday 10:00, Status aktiv · OK, letzter Lauf 10-26 10:04.
4. Öffne **Beschreibung / Befehl** mit **mehr**, um die Beispielanweisung zu lesen.
5. Drücke **Stoppen**. Der Text `Stop: Weekly trend scan (QR bot/p02)` wird kopiert. Füge ihn in deinen QR bot-Chat ein; die Seite selbst sendet nichts.
6. Wechsle in der Kopfzeile die Sprache und drücke **README**, um diese Anleitung in der Sprache zu lesen.

## Daten
Ersetze `data/sample-processes.json` durch deinen eigenen Export (gleiche Struktur). Committe niemals echte Daten oder Schlüssel.

Obsidian-Vault-Leser (nur lesend): `tools/vault-read` — siehe Haupt-README.
