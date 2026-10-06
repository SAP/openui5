#!/usr/bin/env node
/**
 * Unit tests for format-results.js
 *
 * Run from the openui5 repo root:
 *   node .claude/skills/run-test/tests/format-results.test.js
 */

const assert = require("assert");
const path = require("path");

const { formatTable, parseCoverage } = require(path.resolve(__dirname, "..", "scripts", "format-results"));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    failed++;
    console.log(`  FAIL: ${name}`);
    console.log(`    ${err.message}`);
  }
}

// --- dedupeMessages behavior (tested through formatTable) ---

console.log("formatTable — console error surfacing on failing runs");

test("failing run: console error from the failing test itself is printed", () => {
  const out = formatTable([
    { testName: "Table", lib: "sap.ui.mdc", total: 10, passed: 9, failed: 1,
      failures: [{ test: "shows title", message: "expected A, actual B", source: "Table.qunit.js:10" }],
      consoleErrors: [{ test: "shows title", msg: "NODATA derive: A" }] }
  ], false);
  assert.ok(/\[console\] NODATA derive: A/.test(out), "failing-test error must be listed under the test:\n" + out);
});

test("passing run: no console sections are emitted at all", () => {
  const out = formatTable([
    { testName: "Table", lib: "sap.ui.mdc", total: 4, passed: 4, failed: 0,
      consoleErrors: [{ test: "a", msg: "debug line" }] }
  ], false);
  assert.ok(!/console/.test(out), "passing runs must stay silent about captured errors:\n" + out);
});

test("missing droppedErrors (older runner payload) does not crash", () => {
  const out = formatTable([
    { testName: "Table", lib: "sap.ui.mdc", total: 2, passed: 1, failed: 1,
      failures: [{ test: "t", message: "boom", source: "T.qunit.js:1" }] }
  ], false);
  assert.ok(!/dropped at capture/.test(out));
});

test("droppedErrors count is announced with the per-run caps when capture was dropped", () => {
  const errors = [{ test: "failing t", msg: "one" }];
  const out = formatTable([
    { testName: "Table", lib: "sap.ui.mdc", total: 10, passed: 9, failed: 1, droppedErrors: 149,
      failures: [{ test: "failing t", message: "boom", source: "T.qunit.js:1" }],
      consoleErrors: errors }
  ], false);
  assert.ok(/149 additional console\.error messages were not recorded/.test(out),
    "drop notice must state the discarded count:\n" + out);
  assert.ok(/caps: 20 outside tests \/ 20 per test \/ 500 total/.test(out),
    "drop notice must name the per-run caps:\n" + out);
});

test("console messages are not re-cut at display (hook's truncation marker survives)", () => {
  const mk = (msg) => formatTable([
    { testName: "Table", lib: "sap.ui.mdc", total: 10, passed: 9, failed: 1,
      failures: [{ test: "failing t", message: "boom", source: "T.qunit.js:1" }],
      consoleErrors: [{ test: "failing t", msg }] }
  ], false);
  // exactly what the hook ships: 1000 chars + " [truncated]"
  const hookMsg = "2026-07-16 12:00:00.000 " + "y".repeat(1000) + " [truncated]";
  const out = mk(hookMsg);
  assert.ok(out.includes("y".repeat(1000) + " [truncated]"),
    "the hook's truncation marker must reach the output intact:\n" + out);
  // a 500-char message must survive too (old display cap was 200)
  const midMsg = "2026-07-16 12:00:00.100 " + "x".repeat(500);
  const out2 = mk(midMsg);
  assert.ok(out2.includes("x".repeat(500)), "500-char message must survive intact:\n" + out2);
});

test("duplicate console messages are deduplicated", () => {
  const out = formatTable([
    { testName: "Table", lib: "sap.m", total: 5, passed: 4, failed: 1,
      failures: [{ test: "t1", message: "fail", source: "T.qunit.js:1" }],
      consoleErrors: [
        { test: "t1", msg: "same error" },
        { test: "t1", msg: "same error" },
        { test: "t1", msg: "different error" }
      ] }
  ], false);
  const matches = out.match(/\[console\] same error/g);
  assert.strictEqual(matches && matches.length, 1, "duplicate console error should appear only once:\n" + out);
});

test("timestamp prefix is stripped from console messages", () => {
  const out = formatTable([
    { testName: "Table", lib: "sap.m", total: 5, passed: 4, failed: 1,
      failures: [{ test: "t1", message: "fail", source: "T.qunit.js:1" }],
      consoleErrors: [{ test: "t1", msg: "2026-07-16 12:00:00.123 actual error msg" }] }
  ], false);
  assert.ok(out.includes("[console] actual error msg"), "timestamp should be stripped:\n" + out);
  assert.ok(!out.includes("2026-07-16"), "timestamp should not appear:\n" + out);
});

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
