# Features

## Coming soon

- **Write kill-switch (v1.6.1):** vault writes run only when `VAULT_WRITE_ENABLED=1` is set; it is off by default.
- **Owner approval first:** write mode is activated only after the owner's separate, explicit approval.
- **Logging and review:** every write goes to `_bot-writes/` with an append-only `log.md` plus daily summaries, and the `pending/` folder holds writes that wait for approval.
- **One-day observation period:** the code is deployed with writes disabled for one day before activation.

Writing to the Obsidian vault was tested: 20 tests passed with no failures.

Deletion is not permitted: everything is kept.

Cleanup and storage growth are deferred to a later decision.
