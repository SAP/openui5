// format-results.js — Format test results as markdown tables with failure diagnostics.
"use strict";

// ════════════════════════════════════════════════════════════════════
// COVERAGE
// ════════════════════════════════════════════════════════════════════

function parseCoverage(coverageJSON, lib, testName, filePath) {
  if (!coverageJSON) return null;

  let coverageData;
  try { coverageData = JSON.parse(coverageJSON); } catch { return null; }

  const libPath = lib.replace(/\./g, "/");
  // Build candidate module paths.  We try two strategies because the test
  // file location and source location don't always agree:
  //   1. Path derived from the test file path — covers the common case where
  //      qunit/util/File.qunit.js tests sap/ui/core/util/File.js.
  //   2. lib + testName — covers cases where the test sits in a different
  //      subdirectory than the source (e.g. testsuite key "postmessage/Bus"
  //      lives at qunit/util/postmessage/Bus.qunit.js but the source is at
  //      sap/ui/core/postmessage/Bus.js, see the testsuite's coverage.only).
  // Whichever candidate has coverage data wins.
  const candidates = [];
  if (filePath) {
    const fwd = filePath.replace(/\\/g, "/");
    const m = fwd.match(/\/test\/[^/]+(?:\/[^/]+)*?\/(?:qunit|test)\/(.*)\.qunit\.js$/);
    if (m) candidates.push(m[1]);
  }
  candidates.push(testName);

  let modulePathInLib = null;
  for (const c of candidates) {
    const f = `/resources/${libPath}/${c}.js`;
    if (Object.prototype.hasOwnProperty.call(coverageData, f)) { modulePathInLib = c; break; }
  }
  if (modulePathInLib === null) modulePathInLib = candidates[0]; // for perFile reporting fallback

  const moduleFile = `/resources/${libPath}/${modulePathInLib}.js`;
  const moduleRenderer = `/resources/${libPath}/${modulePathInLib}Renderer.js`;
  const testPrefix = `/test-resources/`;

  let primaryLines = 0, primaryCovLines = 0;
  let primaryBranches = 0, primaryCovBranches = 0;
  let primaryUncoveredLines = [];
  let primaryUncoveredBranches = [];
  const perFile = [];

  for (const [filePath, fileData] of Object.entries(coverageData)) {
    if (filePath.includes(testPrefix)) continue;
    if (filePath !== moduleFile && filePath !== moduleRenderer) continue;

    let fileStmts = 0, fileCovStmts = 0;
    if (fileData.s) {
      for (const count of Object.values(fileData.s)) {
        fileStmts++;
        if (count > 0) fileCovStmts++;
      }
    }

    let fileBranches = 0, fileCovBranches = 0;
    if (fileData.b) {
      for (const counts of Object.values(fileData.b)) {
        for (const count of counts) {
          fileBranches++;
          if (count > 0) fileCovBranches++;
        }
      }
    }

    const shortPath = filePath.replace(/^\/resources\//, "");
    perFile.push({
      file: shortPath,
      lines: fileStmts > 0 ? ((fileCovStmts / fileStmts) * 100).toFixed(1) : "N/A",
      branches: fileBranches > 0 ? ((fileCovBranches / fileBranches) * 100).toFixed(1) : "N/A"
    });

    if (filePath === moduleFile) {
      primaryLines = fileStmts;
      primaryCovLines = fileCovStmts;
      primaryBranches = fileBranches;
      primaryCovBranches = fileCovBranches;
      const uncoveredStmtLines = trulyUncoveredStatementLines(fileData);
      primaryUncoveredLines = collapseRanges(uncoveredStmtLines);
      primaryUncoveredBranches = extractUncoveredBranches(fileData, uncoveredStmtLines);
    }
  }

  return {
    linesPct: primaryLines > 0 ? ((primaryCovLines / primaryLines) * 100).toFixed(1) : "N/A",
    branchesPct: primaryBranches > 0 ? ((primaryCovBranches / primaryBranches) * 100).toFixed(1) : "N/A",
    uncoveredLines: primaryUncoveredLines,
    uncoveredBranches: primaryUncoveredBranches,
    perFile
  };
}

// Sorted list of source-line numbers whose statements never executed AND which
// don't also host a covered statement (so `if` headers aren't reported just
// because their else-arm is uncovered).  Feeds both the collapsed "uncovered
// lines" output and the branch-filter that suppresses redundant branch entries.
function trulyUncoveredStatementLines(fileData) {
  if (!fileData.s || !fileData.statementMap) return [];

  const coveredStartLines = new Set();
  const uncoveredStartLines = new Set();

  for (const [id, count] of Object.entries(fileData.s)) {
    const loc = fileData.statementMap[id];
    if (!loc || !loc.start || typeof loc.start.line !== "number") continue;
    (count > 0 ? coveredStartLines : uncoveredStartLines).add(loc.start.line);
  }

  const out = [];
  for (const ln of uncoveredStartLines) {
    if (!coveredStartLines.has(ln)) out.push(ln);
  }
  return out.sort((a, b) => a - b);
}

// Uncovered branch arms — reported only when the arm's start line is NOT
// already in the uncovered-statement list, so we surface only what statement
// coverage misses (empty else, short-circuit `&&`/`||`, ternary arm without a
// dedicated statement, default parameter never triggered).  Each arm is one
// entry — {line, column, type, arm} — so multiple branches on the same line
// remain individually addressable AND the arm identifier (e.g. "else", "falsy",
// "case[2]") tells the reader which side is missing.  Deduped on
// line:column:type:arm (Istanbul sometimes records both arms of an implicit
// else at the same position).
function extractUncoveredBranches(fileData, uncoveredStmtLines) {
  if (!fileData.b || !fileData.branchMap) return [];

  const skipLines = new Set(uncoveredStmtLines);
  const seen = new Set();
  const out = [];

  for (const [id, counts] of Object.entries(fileData.b)) {
    const meta = fileData.branchMap[id];
    if (!meta || !Array.isArray(counts) || !Array.isArray(meta.locations)) continue;
    counts.forEach((count, armIdx) => {
      if (count > 0) return;
      const loc = meta.locations[armIdx];
      const line = loc && loc.start && loc.start.line;
      if (typeof line !== "number") return;
      if (skipLines.has(line)) return;
      const column = loc.start && typeof loc.start.column === "number" ? loc.start.column : null;
      const type = meta.type || "branch";
      const arm = armLabel(type, armIdx, counts.length);
      const key = `${line}:${column}:${type}:${arm}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ line, column, type, arm });
    });
  }

  return out.sort((a, b) => a.line - b.line || (a.column ?? 0) - (b.column ?? 0));
}

// Map (branch type, arm index, total arms) → human-readable arm label.  This
// is the value that answers "which side of the branch is uncovered" — the one
// piece of information that reading raw Istanbul output otherwise forces the
// reader to open the source to figure out.
function armLabel(type, armIdx, armCount) {
  switch (type) {
    case "if":
      return armIdx === 0 ? "then" : "else";
    case "cond-expr":
      return armIdx === 0 ? "truthy" : "falsy";
    case "binary-expr":
      // For `a && b` / `a || b`: arm 0 = short-circuit (LHS decides), arm 1 =
      // full evaluation (RHS runs).  "short-circuit" and "full-eval" is easier
      // to reason about than "left" / "right".
      return armIdx === 0 ? "short-circuit" : "full-eval";
    case "switch":
      // Last arm is the default clause when there is one; earlier arms are
      // ordinary case[N].  Istanbul emits an entry for `default` even when
      // absent, so armCount alone can't tell us — but "case[last]" reading
      // as "default-or-final-case" is close enough for locating source.
      return `case[${armIdx}]`;
    case "default-arg":
      // Single arm — either the default fired or it didn't.  If we're here,
      // it didn't.
      return "unused";
    default:
      return `arm[${armIdx}]`;
  }
}

// Collapse [1, 2, 3, 7, 10, 11] → ["1-3", "7", "10-11"]
function collapseRanges(nums) {
  if (!nums.length) return [];
  const out = [];
  let start = nums[0], prev = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === prev + 1) {
      prev = nums[i];
    } else {
      out.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = prev = nums[i];
    }
  }
  out.push(start === prev ? `${start}` : `${start}-${prev}`);
  return out;
}

// ════════════════════════════════════════════════════════════════════
// FAILURE DIAGNOSTICS
// ════════════════════════════════════════════════════════════════════

function groupFailures(failures) {
  const groups = new Map();
  for (const f of failures) {
    if (!groups.has(f.test)) groups.set(f.test, []);
    groups.get(f.test).push(f);
  }
  return groups;
}

const FRAMEWORK_FILE_RE = /^(qunit[-.]|sinon[-.]|require\.js|sap-ui-core\.js)/i;

function extractTestSource(source) {
  if (!source) return null;
  const re = /([A-Za-z0-9_.-]+\.js):(\d+)(?::\d+)?/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    if (!FRAMEWORK_FILE_RE.test(m[1])) return `${m[1]}:${m[2]}`;
  }
  return null;
}

function classifyFailure(f) {
  if (/^Test timed out/.test(f.message)) return "timeout";
  if (/^(Promise rejected|Died on test|Error:|Uncaught)/.test(f.message)) return "error";
  return "assertion";
}

function cleanErrorMessage(msg) {
  return msg.replace(/^Promise rejected during "[^"]*":\s*/, "")
            .replace(/^Died on test "[^"]*":\s*/, "");
}

function formatTestFailures(assertions) {
  const lines = [];
  const type = classifyFailure(assertions[0]);

  if (type === "timeout") return lines;

  if (type === "error") {
    const msg = cleanErrorMessage(assertions[0].message);
    const src = extractTestSource(assertions[0].source);
    lines.push(`    ${msg}${src ? " @ " + src : ""}`);
    return lines;
  }

  for (const f of assertions) {
    const parts = [];
    if (f.message) parts.push(f.message);
    if (f.expected !== "" || f.actual !== "") {
      parts.push(`expected: ${f.expected}, actual: ${f.actual}`);
    }
    const src = extractTestSource(f.source);
    if (src) parts.push(`@ ${src}`);
    lines.push(`    ${parts.join(" | ") || "assertion failed"}`);
  }
  return lines;
}

// ════════════════════════════════════════════════════════════════════
// TABLE FORMATTING
// ════════════════════════════════════════════════════════════════════

function getDisplayName(r, nameCounts) {
  return nameCounts.get(r.testName) > 1 && r.lib ? `${r.testName} (${r.lib})` : r.testName;
}

// Strip timestamp prefixes, then drop exact duplicates (keeps first-seen order).
// No truncation here — the in-page hook is the single truncation point
// (CONSOLE_MSG_MAX chars + " [truncated]"), so the marker always survives.
function dedupeMessages(msgs) {
  const seen = new Set();
  const out = [];
  for (const msg of msgs) {
    const stripped = msg.replace(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d+ /, "");
    if (!seen.has(stripped)) { seen.add(stripped); out.push(stripped); }
  }
  return out;
}

function formatTable(results, coverageEnabled) {
  const lines = [];
  const hasSkipped = results.some(r => (r.skipped || 0) > 0);

  const headers = ["Module", "Tests", "Passing", "Failing"];
  if (hasSkipped) headers.push("Skipped");
  if (coverageEnabled) headers.push("Lines", "Branches");
  headers.push("Status");
  lines.push("| " + headers.join(" | ") + " |");
  lines.push("|" + headers.map(() => "--------").join("|") + "|");

  // Detect duplicate test names to disambiguate with library
  const nameCounts = new Map();
  for (const r of results) nameCounts.set(r.testName, (nameCounts.get(r.testName) || 0) + 1);

  for (const r of results) {
    const status = r.error
      ? (r.timedOut ? "TIMEOUT" : "ERROR")
      : (r.total === 0 && r.filter) ? "NO MATCH"
      : (r.failed > 0 ? "FAIL" : "PASS");

    let nameCol = r.testName;
    if (nameCounts.get(r.testName) > 1 && r.lib) nameCol += ` (${r.lib})`;
    if (r.filter) nameCol += ` (filter: ${r.filter})`;

    if (r.error) {
      const hasPartial = r.timedOut && r.total > 0;
      if (hasPartial) {
        const statusText = `TIMEOUT (${r.total} tests completed)`;
        const cells = [nameCol, r.total, r.passed, r.failed];
        if (hasSkipped) cells.push(r.skipped || 0);
        if (coverageEnabled) cells.push("-", "-");
        cells.push(statusText);
        lines.push("| " + cells.join(" | ") + " |");
      } else {
        const cells = [nameCol, "-", "-", "-"];
        if (hasSkipped) cells.push("-");
        if (coverageEnabled) cells.push("-", "-");
        cells.push(status);
        lines.push("| " + cells.join(" | ") + " |");
      }
    } else {
      const linesPct = r.coverage ? r.coverage.linesPct + "%" : "N/A";
      const branchesPct = r.coverage ? r.coverage.branchesPct + "%" : "N/A";
      const cells = [nameCol, r.total, r.passed, r.failed];
      if (hasSkipped) cells.push(r.skipped || 0);
      if (coverageEnabled) cells.push(linesPct, branchesPct);
      cells.push(status);
      lines.push("| " + cells.join(" | ") + " |");
    }
  }

  // Timeout details
  for (const r of results) {
    if (r.timedOut && r.currentTest) {
      const displayName = getDisplayName(r, nameCounts);
      lines.push("");
      lines.push(`**${displayName} — Timed out on:** ${r.currentTest}`);
    }
  }

  // Uncovered lines — emitted after the table because ranges can be long and
  // would otherwise wrap the columns. Only shown when coverage is enabled and
  // the module was not fully covered.
  if (coverageEnabled) {
    for (const r of results) {
      if (!r.coverage || !r.coverage.uncoveredLines || r.coverage.uncoveredLines.length === 0) continue;
      const displayName = getDisplayName(r, nameCounts);
      lines.push("");
      lines.push(`**${displayName} — uncovered lines:** ${r.coverage.uncoveredLines.join(", ")}`);
    }
  }

  // Uncovered branches — one entry per uncovered arm, addressed by line:column
  // so multiple branches on the same line (e.g. nested ternaries, chained
  // `&&`/`||`) remain individually locatable.  Only lines NOT already listed
  // in uncovered lines appear, so the section surfaces what statement coverage
  // misses (empty else, short-circuit, ternary arm, unused default parameter).
  if (coverageEnabled) {
    for (const r of results) {
      if (!r.coverage || !r.coverage.uncoveredBranches || r.coverage.uncoveredBranches.length === 0) continue;
      const displayName = getDisplayName(r, nameCounts);
      const parts = r.coverage.uncoveredBranches.map(b => {
        const anchor = typeof b.column === "number" ? `${b.line}:${b.column}` : `${b.line}`;
        const tag = b.arm ? `${b.type}:${b.arm}` : b.type;
        return `${anchor} (${tag})`;
      });
      lines.push("");
      lines.push(`**${displayName} — uncovered branches:** ${parts.join(", ")}`);
    }
  }

  // Failure details
  for (const r of results) {
    if (r.failures && r.failures.length > 0) {
      const displayName = getDisplayName(r, nameCounts);
      const groups = groupFailures(r.failures);
      const errors = r.consoleErrors || [];

      const errorsByTest = new Map();
      for (const e of errors) {
        const key = e.test || "";
        if (!errorsByTest.has(key)) errorsByTest.set(key, []);
        errorsByTest.get(key).push(e.msg);
      }

      lines.push("");

      const loadErrors = errorsByTest.get("") || [];
      if (loadErrors.length > 0) {
        lines.push(`**${displayName} — Load errors:**`);
        for (const m of dedupeMessages(loadErrors)) lines.push(`    - ${m}`);
      }

      lines.push(`**${displayName} — Failing tests (${groups.size}):**`);
      for (const [testName, assertions] of groups) {
        const type = classifyFailure(assertions[0]);
        const tag = type === "timeout" ? " [timeout]" : type === "error" ? " [error]" : ` (${assertions.length} failed)`;
        lines.push(`  - **${testName}**${tag}`);
        lines.push(...formatTestFailures(assertions));
        const testErrors = errorsByTest.get(testName) || [];
        for (const m of dedupeMessages(testErrors)) lines.push(`    [console] ${m}`);
      }

      // The in-page hook caps capture at 20 messages logged outside any test, 20
      // per test, and 500 total per run. Surface the discard count so
      // "no [console] lines" is never mistaken for "nothing was logged".
      if (r.droppedErrors > 0) {
        lines.push("");
        lines.push(`**${displayName} — Console errors dropped at capture (caps: 20 outside tests / 20 per test / 500 total):** ${r.droppedErrors} additional console.error messages were not recorded`);
      }
    }
  }

  return lines.join("\n");
}

module.exports = { formatTable, parseCoverage };
