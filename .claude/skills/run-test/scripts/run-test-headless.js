#!/usr/bin/env node
// run-test-headless.js — Run OpenUI5 QUnit/OPA tests via headless Chrome + CDP.
//
// Usage: node run-test-headless.js --input <INPUT> [--filter <PATTERN>] [--coverage]
//                                  [--timeout <MS>]
//
// --filter applies to the preceding --input. Multiple --input/--filter pairs allowed:
//   --input A --filter X --input B --filter Y
//
// Resolves test URLs by calling find-test-url.js, then runs them headlessly.
//
// Exit codes: 0=pass, 1=failures, 2=timeout, 3=infra error, 4=ambiguous input
"use strict";

const http = require("http");
const path = require("path");
const { execFileSync } = require("child_process");
const { CDPClient, sleep } = require("./cdp-client");
const { formatTable, parseCoverage } = require("./format-results");

const SCRIPT_DIR = __dirname;
const FIND_TEST_URL = path.join(SCRIPT_DIR, "find-test-url.js");

// ════════════════════════════════════════════════════════════════════
// A. ARGUMENT PARSING
// ════════════════════════════════════════════════════════════════════

let inputs = [];
let filters = [];
let coverage = false;
let timeout = 120000;
let userTimeout = false;

if (require.main === module) {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--input":     inputs.push(args[++i]); break;
      case "--coverage":  coverage = true; break;
      case "--timeout":   timeout = parseInt(args[++i], 10); userTimeout = true; break;
      case "--filter":    filters[Math.max(0, inputs.length - 1)] = args[++i]; break;
      default:
        process.stderr.write(`Unknown argument: ${args[i]}. Valid: --input, --filter, --coverage, --timeout\n`);
        process.exit(3);
    }
  }

  if (inputs.length === 0) {
    process.stderr.write("Error: at least one --input is required.\n");
    process.exit(3);
  }
}

// ════════════════════════════════════════════════════════════════════
// B. DEV SERVER DETECTION
// ════════════════════════════════════════════════════════════════════

function httpGetJSON(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, res => {
      if (res.statusCode !== 200) { res.resume(); reject(new Error(`status ${res.statusCode}`)); return; }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch (e) { reject(e); } });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function detectDevServer() {
  for (let port = 8080; port <= 8090; port++) {
    try {
      const json = await httpGetJSON(`http://localhost:${port}/resources/sap-ui-version.json`, 2000);
      if (json.name === "openui5-testsuite") return port;
    } catch {}
  }
  return 0;
}

// ════════════════════════════════════════════════════════════════════
// C. TEST RESOLUTION via find-test-url.js
// ════════════════════════════════════════════════════════════════════

function resolveTest(input, repoRoot) {
  let output;
  try {
    output = execFileSync("node", [FIND_TEST_URL, input, repoRoot], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 30000
    });
  } catch (err) {
    // find-test-url.js exited non-zero
    const stderr = err.stderr ? err.stderr.trim() : "";
    const stdout = err.stdout ? err.stdout.trim() : "";
    if (stderr.includes("No dev server found")) return { error: "No dev server found. Start it with: npm start" };
    if (stderr.includes("No test found") || stdout.includes("ERROR:")) return { error: `No test found for "${input}". ${stdout}` };
    return { error: stderr || stdout || err.message };
  }

  // Parse structured key-value output
  const lines = output.trim().split("\n");
  const kv = {};
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+):\s*(.*)$/);
    if (m) kv[m[1]] = m[2];
  }

  const matchCount = parseInt(kv.MATCHES || "0", 10);
  if (matchCount === 0) return { error: `No test found for "${input}"` };

  const tests = [];
  if (matchCount === 1) {
    tests.push({
      testName: kv.TEST_KEY || input,
      lib: kv.LIBRARY || "",
      testpageUrl: kv.TEST_URL || "",
      filePath: kv.TEST_FILE || ""
    });
  } else {
    // Multiple matches — collect all
    for (let i = 1; i <= matchCount; i++) {
      tests.push({
        testName: kv[`MATCH_${i}_TEST_KEY`] || input,
        lib: kv[`MATCH_${i}_LIBRARY`] || "",
        testpageUrl: kv[`MATCH_${i}_TEST_URL`] || "",
        filePath: kv[`MATCH_${i}_TEST_FILE`] || ""
      });
    }
  }

  return { tests };
}

// ════════════════════════════════════════════════════════════════════
// D. QUNIT HOOK INJECTION
// ════════════════════════════════════════════════════════════════════

// The in-page filter is applied via the test page URL (QUnit's native
// `filter` URL parameter — see makeTestUrl). It must NOT be set on
// QUnit.config from the hook: QUnit 2 unconditionally overwrites
// config.filter from the URL after window.QUnit is assigned, which
// silently wipes any in-page value before the first QUnit.test() runs.
function makeHookScript() {
  return `(function() {
  var _qunit = window.QUnit, hooked = false, failures = [];
  var consoleErrors = [], consoleWarns = [];
  var droppedErrors = 0;
  var CONSOLE_OUTSIDE_CAP = 20;
  var CONSOLE_TEST_CAP = 20;
  var CONSOLE_GLOBAL_CAP = 500;
  var CONSOLE_MSG_MAX = 1000;
  var outsideErrorCount = 0, perTestErrorCounts = {};
  var testCount = 0, passCount = 0, failCount = 0, skipCount = 0;
  var currentTest = '', currentTestName = '';
  var origError = console.error, origWarn = console.warn;
  console.error = function() {
    if (consoleErrors.length >= CONSOLE_GLOBAL_CAP) {
      droppedErrors++;
      origError.apply(console, arguments);
      return;
    }
    var msg = Array.from(arguments).join(' ');
    if (msg.length > CONSOLE_MSG_MAX) msg = msg.substring(0, CONSOLE_MSG_MAX) + ' [truncated]';
    if (currentTestName === '') {
      if (outsideErrorCount < CONSOLE_OUTSIDE_CAP) {
        consoleErrors.push({ test: '', msg: msg });
        outsideErrorCount++;
      } else droppedErrors++;
    } else {
      var n = perTestErrorCounts[currentTestName] || 0;
      if (n < CONSOLE_TEST_CAP) {
        consoleErrors.push({ test: currentTestName, msg: msg });
        perTestErrorCounts[currentTestName] = n + 1;
      } else droppedErrors++;
    }
    origError.apply(console, arguments);
  };
  console.warn = function() {
    if (consoleWarns.length < 50) consoleWarns.push({ test: currentTestName, msg: Array.from(arguments).join(' ') });
    origWarn.apply(console, arguments);
  };
  function hookQUnit(Q) {
    if (hooked || !Q || !Q.begin) return;
    hooked = true;
    Q.begin(function() {
      var isOpa = !!(window.sap && sap.ui && sap.ui.test && sap.ui.test.Opa5);
      __cdpTestType(isOpa ? "opa" : "qunit");
    });
    Q.log(function(d) {
      if (!d.result && failures.length < 50) {
        failures.push({
          module: d.module || '',
          test: d.name || '',
          message: String(d.message != null ? d.message : '').substring(0, 200),
          expected: String(d.expected != null ? d.expected : '').substring(0, 100),
          actual: String(d.actual != null ? d.actual : '').substring(0, 100),
          source: String(d.source != null ? d.source : '').substring(0, 300)
        });
      }
    });
    Q.testStart(function(d) {
      currentTestName = d.name || '';
      currentTest = (d.module ? d.module + ' > ' : '') + currentTestName;
      window.__cdpPartial = { passed: passCount, failed: failCount, skipped: skipCount, total: testCount,
        currentTest: currentTest,
        failures: failures, consoleErrors: consoleErrors, consoleWarns: consoleWarns, droppedErrors: droppedErrors };
    });
    Q.testDone(function(d) {
      testCount++;
      if (d.skipped) skipCount++;
      else if (d.failed > 0) failCount++;
      else passCount++;
      currentTest = '';
      currentTestName = '';
      window.__cdpPartial = { passed: passCount, failed: failCount, skipped: skipCount, total: testCount,
        failures: failures, consoleErrors: consoleErrors, consoleWarns: consoleWarns, droppedErrors: droppedErrors };
    });
    Q.done(function(r) {
      __cdpDone(JSON.stringify({
        passed: passCount,
        failed: failCount,
        skipped: skipCount,
        total: testCount,
        assertions: { passed: r.passed, failed: r.failed, total: r.total },
        runtime: r.runtime,
        failures: failures,
        consoleErrors: consoleErrors,
        consoleWarns: consoleWarns,
        droppedErrors: droppedErrors
      }));
    });
  }
  Object.defineProperty(window, 'QUnit', {
    get: function() { return _qunit; },
    set: function(val) {
      _qunit = val;
      if (val && typeof val === 'object') {
        var ob = val.begin;
        Object.defineProperty(val, 'begin', {
          get: function() { return ob; },
          set: function(fn) {
            ob = fn;
            setTimeout(function() { hookQUnit(val); }, 0);
          },
          configurable: true,
          enumerable: true
        });
        if (typeof ob === 'function') hookQUnit(val);
      }
    },
    configurable: true
  });
  if (_qunit && _qunit.begin) hookQUnit(_qunit);
})();`;
}

// Builds the page URL for one test run. The filter goes into the URL query
// string — QUnit 2 natively reads `filter` from the URL params. (Setting
// QUnit.config.filter from the in-page hook does NOT work: QUnit overwrites
// it from the URL right after window.QUnit is assigned, before any
// QUnit.test() registration, so the in-page value would be silently lost.)
function makeTestUrl(testUrl, filter, coverageFlag) {
  let url = testUrl.includes("hidepassed") ? testUrl : testUrl +
    (testUrl.includes("?") ? "&" : "?") + "hidepassed=true";
  if (filter) url += "&filter=" + encodeURIComponent(filter);
  if (coverageFlag) url += "&coverage=true";
  return url;
}

// ════════════════════════════════════════════════════════════════════
// E. TEST EXECUTION
// ════════════════════════════════════════════════════════════════════

const LOAD_ERROR_RE = /failed to load .*resource|ModuleSystem/i;
const DIED_ON_TEST_RE = /^Died on test/;

function isLoadErrorFlake(result) {
  if (!result || result.error) return false;
  if (!Array.isArray(result.failures) || result.failures.length === 0) return false;

  const diedOnTest = result.failures.some(f => DIED_ON_TEST_RE.test(f.message || ""));
  if (!diedOnTest) return false;

  const inConsole = Array.isArray(result.consoleErrors) &&
    result.consoleErrors.some(e => LOAD_ERROR_RE.test(e.msg || ""));
  const inFailures = result.failures.some(f =>
    LOAD_ERROR_RE.test(f.message || "") || LOAD_ERROR_RE.test(f.source || ""));

  return inConsole || inFailures;
}

async function runOneTest(cdp, test, timeoutMs) {
  const testFilter = test.filter || "";
  const finalUrl = makeTestUrl(test.testpageUrl, testFilter, coverage);

  const createResult = await cdp.send("Target.createTarget", { url: "about:blank" });
  const targetId = createResult.result.targetId;
  const attachResult = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const sessionId = attachResult.result.sessionId;

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Runtime.addBinding", { name: "__cdpDone" }, sessionId);
  await cdp.send("Runtime.addBinding", { name: "__cdpTestType" }, sessionId);
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: makeHookScript() }, sessionId);

  const result = await new Promise(async (resolve) => {
    const startTime = Date.now();
    let timer = setTimeout(async () => {
      let partial = {};
      try {
        const evalResult = await cdp.send("Runtime.evaluate", {
          expression: "JSON.stringify(window.__cdpPartial || {})",
          returnByValue: true
        }, sessionId);
        if (evalResult.result && evalResult.result.result && evalResult.result.result.value) {
          partial = JSON.parse(evalResult.result.result.value);
        }
      } catch {}
      resolve({ error: "TIMEOUT", timedOut: true, ...partial });
    }, timeoutMs);

    cdp.on("Runtime.bindingCalled", params => {
      if (params.name === "__cdpTestType") {
        clearTimeout(timer);
        const isOpa = params.payload === "opa";
        const effectiveTimeout = userTimeout ? timeoutMs : (isOpa ? 300000 : 120000);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(effectiveTimeout - elapsed, 10000);
        timer = setTimeout(async () => {
          let partial = {};
          try {
            const evalResult = await cdp.send("Runtime.evaluate", {
              expression: "JSON.stringify(window.__cdpPartial || {})",
              returnByValue: true
            }, sessionId);
            if (evalResult.result && evalResult.result.result && evalResult.result.result.value) {
              partial = JSON.parse(evalResult.result.result.value);
            }
          } catch {}
          resolve({ error: "TIMEOUT", timedOut: true, ...partial });
        }, remaining);
      } else if (params.name === "__cdpDone") {
        clearTimeout(timer);
        try { resolve(JSON.parse(params.payload)); } catch { resolve({ error: "PARSE_ERROR" }); }
      }
    }, sessionId);

    await cdp.send("Page.navigate", { url: finalUrl }, sessionId);
  });

  // Collect coverage if enabled
  let coverageResult = null;
  if (coverage && !result.error) {
    try {
      const evalResult = await cdp.send("Runtime.evaluate", {
        expression: "JSON.stringify(window.__coverage__ || window.top.__coverage__)",
        returnByValue: true
      }, sessionId);
      if (evalResult.result && evalResult.result.result && evalResult.result.result.value) {
        coverageResult = parseCoverage(evalResult.result.result.value, test.lib, test.testName, test.filePath);
      }
    } catch {}
  }

  cdp.off("Runtime.bindingCalled", sessionId);
  try { await cdp.send("Target.closeTarget", { targetId }); } catch {}

  return { ...result, coverage: coverageResult };
}

// ════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════

async function main() {
  // Detect dev server
  const port = await detectDevServer();
  if (!port) {
    process.stderr.write("ERROR: No dev server found on ports 8080-8090.\nStart it with: npm start\n");
    process.exit(3);
  }
  process.stderr.write(`Dev server detected on port ${port}.\n`);

  // Resolve all inputs
  const repoRoot = process.cwd();
  const allTests = [];

  for (let i = 0; i < inputs.length; i++) {
    const resolution = resolveTest(inputs[i], repoRoot);
    if (resolution.error) {
      process.stderr.write(resolution.error + "\n");
      process.exit(3);
    }

    // If multiple matches found for a single input, list them as ambiguous
    if (resolution.tests.length > 1) {
      process.stdout.write(`AMBIGUOUS:${resolution.tests.length}\n`);
      for (const t of resolution.tests) {
        process.stdout.write(`${t.lib}: ${t.testName} → ${t.testpageUrl}\n`);
      }
      process.exit(4);
    }

    const test = resolution.tests[0];
    // Ensure URL is absolute
    if (test.testpageUrl && !test.testpageUrl.startsWith("http")) {
      test.testpageUrl = `http://localhost:${port}/${test.testpageUrl.replace(/^\//, "")}`;
    }
    if (filters[i]) test.filter = filters[i];
    allTests.push(test);
  }

  // Print resolved tests
  for (const t of allTests) {
    process.stderr.write(`Resolved: ${t.testName} (${t.lib}) → ${t.testpageUrl}\n`);
  }

  // Launch Chrome
  const CDP_PORT = 9222 + Math.floor(Math.random() * 100);
  const cdp = new CDPClient();

  let exitCode = 0;
  try {
    const info = await cdp.launch(CDP_PORT);
    await cdp.connect(info.webSocketDebuggerUrl);

    // Run tests sequentially
    const results = [];
    for (let ti = 0; ti < allTests.length; ti++) {
      if (ti > 0) await sleep(1000);
      const test = allTests[ti];
      let result = await runOneTest(cdp, test, timeout);

      // Retry load-error flakes once
      if (isLoadErrorFlake(result)) {
        process.stderr.write(`Load-error flake detected for ${test.testName} — retrying once...\n`);
        await sleep(2000);
        result = await runOneTest(cdp, test, timeout);
      }

      result.testName = test.testName;
      result.lib = test.lib;
      results.push(result);

      if (test.filter) result.filter = test.filter;

      if (result.timedOut) exitCode = Math.max(exitCode, 2);
      else if (result.error) exitCode = Math.max(exitCode, 3);
      else if (result.total === 0 && test.filter) exitCode = Math.max(exitCode, 1);
      else if (result.failed > 0) exitCode = Math.max(exitCode, 1);
    }

    // Output
    const output = formatTable(results, coverage);
    process.stdout.write(output + "\n");

  } finally {
    cdp.cleanup();
  }

  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(err => {
    process.stderr.write("Fatal: " + err.message + "\n");
    process.exit(3);
  });
}

module.exports = { isLoadErrorFlake, makeHookScript, makeTestUrl };
