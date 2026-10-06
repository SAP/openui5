#!/usr/bin/env node
/**
 * Unit tests for run-test-headless.js (exported helpers)
 *
 * Run from the openui5 repo root:
 *   node .claude/skills/run-test/tests/run-test-headless.test.js
 */

const assert = require("assert");
const path = require("path");

const { isLoadErrorFlake, makeHookScript, makeTestUrl } = require(
  path.resolve(__dirname, "..", "scripts", "run-test-headless")
);

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

// --- makeHookScript — console.error capture bookkeeping ---

console.log("makeHookScript — console.error capture bookkeeping");

test("emitted hook script enforces the capture caps (20 outside / 20 per test / 500 total, 1000-char messages)", () => {
  const src = makeHookScript();
  assert.ok(src.includes("droppedErrors++"),
    "hook must count console.error calls that miss a cap:\n" + src);
  assert.ok(/var CONSOLE_OUTSIDE_CAP = 20;/.test(src), "empty-tag bucket must be capped at 20");
  assert.ok(/var CONSOLE_TEST_CAP = 20;/.test(src), "per-test bucket must be capped at 20");
  assert.ok(/var CONSOLE_GLOBAL_CAP = 500;/.test(src), "global capture cap must be 500");
  assert.ok(/var CONSOLE_MSG_MAX = 1000;/.test(src) && src.includes("[truncated]"),
    "over-long messages must be truncated at capture time");
});

test("emitted hook script does not set QUnit.config.filter (URL param is the filter path)", () => {
  const src = makeHookScript();
  assert.ok(!src.includes("config.filter"), "hook must not touch config.filter:\n" + src);
  assert.ok(!src.includes("applyFilter"), "dead applyFilter machinery must be gone");
});

test("emitted hook script ships droppedErrors in final payload and partial snapshots", () => {
  const src = makeHookScript();
  const finalPayload = src.split("__cdpDone(JSON.stringify")[1] || "";
  assert.ok(/droppedErrors:\s*droppedErrors/.test(finalPayload),
    "final QUnit.done payload must carry the drop count");
  const partials = (src.match(/window\.__cdpPartial/g) || []).length;
  assert.strictEqual(partials, 2, "both testStart and testDone partials must exist");
  assert.ok((src.match(/consoleWarns: consoleWarns, droppedErrors: droppedErrors/g) || []).length >= 2,
    "every __cdpPartial snapshot must carry the drop count (timeout path reads it)");
});

test("emitted hook script still forwards to the original console methods", () => {
  const src = makeHookScript();
  assert.ok(src.includes("origError.apply(console, arguments)"));
  assert.ok(src.includes("origWarn.apply(console, arguments)"),
    "originals must still receive the messages");
});

// --- makeTestUrl — filter travels via the page URL ---

console.log("\nmakeTestUrl — filter travels via the page URL");

test("appends an encoded filter param when given", () => {
  const url = makeTestUrl("http://localhost:8080/resources/sap/ui/test/starter/Test.qunit.html?test=Foo", "title bar", false);
  assert.ok(url.includes("hidepassed=true"));
  assert.ok(url.includes("filter=" + encodeURIComponent("title bar")),
    "filter must be URL-encoded in the query string:\n" + url);
  assert.ok(!url.includes("coverage=true"), "no coverage param when disabled");
});

test("leaves the URL unchanged without a filter, adds coverage when enabled", () => {
  const url = makeTestUrl("http://localhost:8080/resources/x?test=Foo", null, true);
  assert.ok(!url.includes("filter="), "no filter param when none given:\n" + url);
  assert.ok(url.includes("coverage=true"), "coverage param must be present:\n" + url);
});

test("does not double-add hidepassed if already present", () => {
  const url = makeTestUrl("http://localhost:8080/resources/x?test=Foo&hidepassed=true", "f", false);
  const matches = url.match(/hidepassed/g);
  assert.strictEqual(matches.length, 1, "hidepassed should appear only once:\n" + url);
});

// --- isLoadErrorFlake (existing) ---

console.log("\nisLoadErrorFlake");

test("true when Died on test + failed to load resource in console", () => {
  assert.strictEqual(isLoadErrorFlake({
    failures: [{ message: "Died on test #1: x" }],
    consoleErrors: [{ msg: "failed to load JavaScript resource: sap/m/Button.js" }]
  }), true);
});

test("false when no Died on test", () => {
  assert.strictEqual(isLoadErrorFlake({
    failures: [{ message: "expected 1 but got 2" }],
    consoleErrors: [{ msg: "failed to load JavaScript resource: x" }]
  }), false);
});

test("false on null or empty results", () => {
  assert.strictEqual(isLoadErrorFlake(null), false);
  assert.strictEqual(isLoadErrorFlake({}), false);
  assert.strictEqual(isLoadErrorFlake({ failures: [] }), false);
});

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
