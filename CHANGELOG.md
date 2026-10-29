# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning: [SemVer](https://semver.org/).
Entries before 2.0.0 come from the earlier private development history (commit hashes in brackets refer to that history and are not part of this repository).

## [2.0.2] - 2026-10-29
### Changed
- Projects section now renders above the process cards; regression test asserts the order.
- Personal-data rescan of tracked tree and built output.

## [2.0.1] - 2026-10-29
### Fixed
- Dark mode: the page background was never set (body stayed white) and the manual toggle only CSS-inverted the page, so "Dark" could render light and unreadable. The theme is now chosen in one place (`useTheme(mode)`), applies real dark colors (bg #0f1115, surface #181b22, text #e6e8eb, muted #9aa3ad, borders #2a2f38) via CSS variables on `<html>`, defaults to the system preference and persists the Auto/Light/Dark choice in localStorage.
- Removed hard-coded light colors from badges, buttons, selects and the example-data banner; dark chart palette added.
- All text, badge and chart colors meet WCAG AA (4.5:1) on every surface in both themes (new `test/theme.test.tsx`).

## [2.0.0] - 2026-10-28 (public edition)
### Changed (breaking)
- New public repository with a fresh history, built from the 1.7.2 tree.
- `tools/vault-read`: the default exclude list is now generic (`.obsidian`, `.trash`, `.git`, `private`, `secrets`, `credentials`). Site-specific excludes go into `vault.excludes` in a git-ignored `config.local.json` (or `$OPS_CONFIG`), in addition to `VAULT_EXCLUDE`.
- `tools/gen-recent`: the vault folder map (`vault.sections`) and title-only kinds (`vault.titleOnlyKinds`) are read from config; neutral defaults ship in `config.example.json`.
- Tests and fixtures use neutral names only (Bot A/B/C, `Private/`, `Archive/private-mail/`).
- Python is invoked as `$PYTHON`, else `python` on Windows and `python3` elsewhere.
### Added
- MIT `LICENSE`, `engines.node >=18`, `SECURITY.md`, `config.example.json`.
- `test/leak-scan.test.ts`: fails if any private term appears in the repository. Terms come from `LEAK_TERMS` or `leakScan.terms` in the git-ignored local config; the repository never contains them.
- `test/config.test.ts`: config loading, git-ignore rules, generic default excludes, Windows-style path handling.
- `.github/workflows/ci.yml`: ubuntu/macos/windows × Node 18/20/22 (npm ci, test, build) plus gitleaks.
- Fresh screenshots from sample data (`docs/screenshots/`).
### Removed
- Internal concept document and its README link.

## [1.7.2] - 2026-10-28
### Added
- `vault-read audit/recent`: approved attribution lists outside the vault (`VAULT_APPROVED_LIST`, JSON); an entry applies only while the note's mtime equals the listed mtime (±tolerance). `writer: UNKNOWN` + `status: unknown-accepted` counts as accepted and is reported as `unknown_accepted`.
- Per-run `write-log.md` next to `CHANGES.txt` in manifest dirs (`- time | BOT: name | action | path`).
### Changed
- Tests for BOT: lines, write-log.md and the approved list.

## [1.7.1] - 2026-10-28
### Fixed
- `tools/gen-recent`: notes under the configured memory folder(s) are always title-only (no content summary), matching the dashboard's privacy rule.
### Added
- `tools/gen-recent --alias WRITER=Name` (display names for manifest writers) and `--keep-desc` (reuse existing summaries by path).

## [1.7.0] - 2026-10-28
### Added
- `tools/vault-read recent [--since ISO | --hours N] [--limit N]` (read-only): notes changed in the window, newest first, with created/modified time, size and writer attribution.
- `tools/vault-read audit` (read-only): exits 1 and lists every changed note that cannot be attributed to a writer. Attribution sources, in order: the `_bot-writes/log.md` write log (within 10 minutes of the change), change manifests of out-of-band jobs (`VAULT_MANIFEST_DIRS`, `<dir>/<run>/CHANGES.txt`, optional `BOT:` / `JOB:` header), then `bot:` / `written_by:` / `source:` frontmatter.
- `create --stamp`: adds `bot`, `written` and `source: vault-read` frontmatter to new notes. Writes stay off by default (`VAULT_WRITE_ENABLED`).
- `tools/gen-recent`: builds the dashboard's "Recently saved" data from `vault-read --json recent` output at refresh time instead of a hardcoded list.
- Tests: `test/vault-recent.test.ts`.
### Changed
- "Recently saved" caption counts come from the data (`{n}` shown, `{t}` changed in window) instead of fixed numbers.

## [1.6.2] - 2026-10-27
### Added
- `tools/vault-read --version` prints `vault-read 1.6.2` and exits 0; it reads and writes nothing. No other behavior changed.

## [1.6.1] - 2026-10-27
### Added
- Write kill-switch: `create`, `append` (incl. `--pending`) and `approve` run only when `VAULT_WRITE_ENABLED=1` is set in the env or `.env`. Default is disabled: the command exits non-zero with "writes are disabled (set VAULT_WRITE_ENABLED=1)" and touches nothing (no log entry, no directories). `pending list` stays read-only and allowed.
- Tests: writes refused by default with the vault unchanged; writes work when enabled.

## [1.6.0] - 2026-10-27
### Added
- `tools/vault-read` write mode: `create` (new notes only, fails if the file exists) and `append` (existing notes only); text from `--text` or stdin; `--bot <name>` required on every write. No delete, overwrite or rename.
- Append-only write log `_bot-writes/log.md` in the vault (ISO time, bot, command, path, first 200 characters, sha256 of the full text) and daily summary `_bot-writes/daily/YYYY-MM-DD.md` (counts per bot + paths).
- `--pending` mode (stored in `_bot-writes/pending/`, target untouched), read-only `pending list`, owner-only `approve <id>` (honours create/append rules, logged).
- Safety: exclude list, traversal and symlink blocks apply to writes; `.obsidian`, excluded paths and the log area are never written; secret-looking lines redacted before writing and logging; atomic create, append-mode append.
- Tests on the fake vault (`test/vault-write.test.ts`); README write section in all 9 languages.

## [1.5.2] - 2026-10-27
### Changed
- README.md and all translated READMEs (hu, de, fr, it, pt, es, ja, zh): new "Why Obsidian / Why the vault reader" section, including the "Knowledge base first, then ask the owner" principle.
- All 9 READMEs: generic vault connection steps with placeholders (`<your-vault-name>`, `<host where the vault lives>`, sync mode, `VAULT_PATH` in `.env` + `tools/vault-read`).
- Vision doc: section 8 adds the knowledge-base-first principle; version line 1.5.2.

## [1.5.1] - 2026-10-27
### Changed
- Vision doc: visible version line under the title, "Version history" section, section 8 lists the read-only vault reader as a finished building block.

## [1.5.0] - 2026-10-27
### Added
- `tools/vault-read`: read-only Obsidian vault reader CLI (search, read, list, tags, count, `--json`), Python 3 stdlib only.
- Vault path only from `VAULT_PATH` env or git-ignored `.env`; placeholder in `.env.example`.
- Tests on a fake vault (`test/fixtures/sample-vault`): excludes, traversal/symlink blocking, vault unchanged.
### Security
- Built-in exclude list (extendable via `VAULT_EXCLUDE`), secret-looking line redaction, no writes to the vault.

## [1.4.2] - 2026-10-27
### Added
- Pro-human principle in the vision doc Values section.

## [1.4.1] - 2026-10-27
### Added
- Values section in the vision doc: no exclusionary religions, respect for every belief; ideologies examined like philosophers do.

## [Unreleased]

## [1.4.0] - 2026-10-27
### Added

## [1.3.0] - 2026-10-27
### Added
- Visible version label in the footer, read from package.json at build time.
- CHANGELOG.md and annotated git tags for every release.

## [1.2.0] - 2026-10-27 (a80ecd4)
### Added
- i18n: More/Less and project field labels in the language switcher.
- README install steps in all translations.
- Playwright screenshots and gallery (sample data only).

## [1.1.0] - 2026-10-27 (6df1799)
### Added
- Example project cards with an accessible More/Less toggle.
- README "Install and run (step by step)" section; toggle test.

## [1.0.2] - 2026-10-27 (1d25227)
### Fixed
- Jumping to a card now clears the category filter.
### Added
- Vitest tests and `npm test`.

## [1.0.1] - 2026-10-27 (cfad948)
### Security
- Hardened .gitignore for public release (credentials, keys, logs).

## [1.0.0] - 2026-10-27 (262ec5b)
### Added
- Process dashboard v1: example data, 9 languages, Obsidian adapter.
