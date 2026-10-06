---
name: run-test
description: 'Run QUnit and OPA tests for OpenUI5 modules via headless Chrome. This is the ONLY way to run tests — never use karma, npm test, or browser MCP tools. Use whenever tests need execution: run tests, run unit tests, check tests pass, verify my change, do the tests still pass, run QUnit, run OPA, execute test suite, test this module, test Button/Router/Table/Dialog/MessageBox/Input/Control, run journey, check regressions. Even if the user does not say "test" explicitly but wants to verify a code change works, use this skill.'
argument-hint: 'Example: /run-test sap.m.Button or /run-test Button or /run-test src/sap.m/test/sap/m/qunit/Button.qunit.js or /run-test sap.ui.core.util.Popup'
user-invocable: true
---

# Run Test — Execute QUnit Tests via Headless Chrome

Run existing tests and get structured results. The script handles everything: test file resolution, headless Chrome lifecycle, QUnit hook injection, and result collection.

**Not for writing tests** — this skill only runs existing tests.

## Inputs

Optional argument — a test identifier:

| Input form | Example | Resolution |
|-----------|---------|------------|
| File path (`.qunit.js`) | `src/sap.m/test/.../Button.qunit.js` | Direct — fastest, no search needed |
| Fully-qualified module | `sap.m.Button` | Converts dots to path, finds test file |
| Short name | `Button` | Matches against all test dirs |
| Slash notation | `sap/ui/core/routing/Router` | Converted to dot notation |

**OPA tests**: Pass fully-qualified module names or short names the same way. OPA tests are auto-detected at runtime and get a longer default timeout (300s vs 120s for QUnit).

## Procedure

### Step 1 — Run the test

**Do not pipe the output through `tail`, `head`, or any truncation.** The output is already bounded. Truncating risks losing the results table or failure details.

```bash
node <this-skill-dir>/scripts/run-test-headless.js --input "<ARGUMENT>"
```

**Flags:**
- `--input "<X>"` — repeatable, each resolved independently
- `--filter "<substring>"` — binds to preceding `--input`, filters QUnit test names by substring (not regex). Use when the user mentions a specific method — runs only matching tests, much faster
- `--coverage` — only when user explicitly asks
- `--timeout <ms>` — override default (120s QUnit, 300s OPA auto-detected)

**Per-input filters** — each `--filter` applies to the `--input` before it:
```bash
node <this-skill-dir>/scripts/run-test-headless.js \
  --input "<PATH_1>" --filter "<FILTER_1>" --input "<PATH_2>" --filter "<FILTER_2>"
```

### Step 2 — Interpret and report

**Exit codes:**

| Exit | Meaning | Action |
|------|---------|--------|
| 0 | All tests pass | Report the table |
| 1 | Failures or filter matched 0 tests | Read failure details or check the filter substring |
| 2 | Timeout | Check which test hung (printed after the table) |
| 3 | Infra error (dev server, Chrome) | Report to user |
| 4 | Ambiguous input | Output lists candidates. Pick the right one using context, or ask user. Re-run with `<lib>.<testName>` (e.g. `sap.m.Button`) |

**No dev server** — if the script reports no dev server found, tell the user to start it with `npm start`, then retry.

**Interpreting failures** — the remote branch is always green (tests must pass before merge):

- **Load-error flake** → a `Died on test #1` accompanied by a `failed to load ... resource` load/console error is a transient cold-server flake. The script already retries such a test once automatically. If it still reports after the automatic retry, re-run the command once more; only investigate if it persists across a fresh run.
- **Consistent failure** → caused by the local change. Investigate and fix.
- **Intermittent failure (passes on re-run)** → likely flaky. Re-run once to confirm. If it passes, note the flakiness but don't block.
- **Failure in a module you didn't touch** → still caused by the local change (shared utility modified, dependency changed). Investigate the connection.

**Never stash, commit, or revert changes to check whether a failure is "pre-existing".** The base/remote branch is always green. Every failure on top of a green base is caused by the local change — find the connection instead of trying to prove it isn't yours.

**After a filtered PASS**: A filtered run validates only a subset. Always offer to run the full unfiltered suite to check for regressions.

Present results as a table to the user, including failure details and console errors. On a failing run the output may include these sections after the table — report them, don't discard them:

- `**Module — Load errors:**` — console errors logged before any test started (page load phase).
- `[console] …` under a failing test — errors logged while that test ran. Only errors attributable to a failing test are printed; errors captured during passing tests are not surfaced.
- `**Module — Console errors dropped at capture (caps: 20 outside tests / 20 per test / 500 total):** N …` — an in-page capture cap was hit and N further `console.error` calls were never recorded. If you added debug logging and see this (or expect `[console]` lines that are absent), the capture may not reflect the failing test's messages — the caps were filled by other (earlier or louder) tests.

Nothing is printed on passing runs: captured console errors/warnings are only surfaced when the run has failures.
