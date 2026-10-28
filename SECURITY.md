# Security policy

## Supported versions
Only the latest 2.x release receives fixes.

## Reporting a vulnerability
Please do not open a public issue. Use GitHub's private vulnerability reporting ("Security" tab → "Report a vulnerability") on this repository. We aim to reply within 7 days.

## Design and threat model
- The dashboard is a static single page: it makes no network calls and ships fictional sample data only.
- `tools/vault-read` is read-only by default. Write commands (`create`, `append`, `pending`, `approve`) are refused unless `VAULT_WRITE_ENABLED=1`. They only create new notes or append; there is no delete, overwrite or rename. Every write is logged in `<vault>/_bot-writes/`.
- Path safety: absolute paths, `..` traversal (also with Windows backslashes), symlinks leaving the vault, `.obsidian`, the log area and excluded folders are blocked.
- Output redaction: lines that look like passwords, tokens, API keys, private keys or seed phrases are replaced with `[REDACTED]`. This is a safety net, not a guarantee; keep secrets out of the vault.
- Local configuration (`.env`, `config.local.json`) is git-ignored. Never commit real vault paths, names, hosts or keys.
- `test/leak-scan.test.ts` plus gitleaks in CI guard against accidental commits of private terms or secrets. Keep your private term list in `config.local.json` (`leakScan.terms`) or `LEAK_TERMS`.
