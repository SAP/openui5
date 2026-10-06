#!/usr/bin/env node
/**
 * Integration tests for find-test-url.js
 *
 * Prerequisites:
 *   - Dev server running (npm run start)
 *   - Run from the openui5 repo root: node .claude/skills/run-test/tests/find-test-url.test.js
 */

const { execFileSync } = require("child_process");
const path = require("path");

const SCRIPT = path.resolve(__dirname, "..", "scripts", "find-test-url.js");
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

let passed = 0;
let failed = 0;
const failures = [];

// --- Helpers ---

function run(moduleName) {
	try {
		const output = execFileSync("node", [SCRIPT, moduleName, REPO_ROOT], {
			encoding: "utf8",
			timeout: 60000
		});
		return parseOutput(output);
	} catch (err) {
		// Script exited with non-zero (e.g., ERROR cases)
		const output = (err.stdout || "") + (err.stderr || "");
		return parseOutput(output);
	}
}

function parseOutput(output) {
	const result = { _raw: output, _matches: [] };
	for (const line of output.split("\n")) {
		const colonIdx = line.indexOf(": ");
		if (colonIdx === -1) continue;
		const key = line.substring(0, colonIdx).trim();
		const value = line.substring(colonIdx + 2).trim();
		result[key] = value;
	}

	// Parse multi-match output into array
	const matchCount = parseInt(result.MATCHES, 10) || 0;
	if (matchCount > 1) {
		for (let i = 1; i <= matchCount; i++) {
			result._matches.push({
				TEST_FILE: result[`MATCH_${i}_TEST_FILE`],
				LIBRARY: result[`MATCH_${i}_LIBRARY`],
				TEST_KEY: result[`MATCH_${i}_TEST_KEY`],
				TESTSUITE: result[`MATCH_${i}_TESTSUITE`],
				URL_TYPE: result[`MATCH_${i}_URL_TYPE`],
				TEST_URL: result[`MATCH_${i}_TEST_URL`]
			});
		}
	} else if (matchCount === 1) {
		result._matches.push({
			TEST_FILE: result.TEST_FILE,
			LIBRARY: result.LIBRARY,
			TEST_KEY: result.TEST_KEY,
			TESTSUITE: result.TESTSUITE,
			URL_TYPE: result.URL_TYPE,
			TEST_URL: result.TEST_URL
		});
	}
	return result;
}

function assert(testName, condition, detail) {
	if (condition) {
		passed++;
	} else {
		failed++;
		failures.push({ testName, detail });
		console.log(`  FAIL: ${detail}`);
	}
}

function test(name, fn) {
	console.log(`\n[TEST] ${name}`);
	try {
		fn();
	} catch (err) {
		failed++;
		failures.push({ testName: name, detail: err.message });
		console.log(`  ERROR: ${err.message}`);
	}
}

// --- Tests ---

test("sap.m.Button — qualified name, single match", () => {
	const r = run("sap.m.Button");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.m", `Expected library sap.m, got ${r.LIBRARY}`);
	assert("test key", r.TEST_KEY === "Button", `Expected key Button, got ${r.TEST_KEY}`);
	assert("test file found", r.TEST_FILE && r.TEST_FILE !== "null", `Expected test file, got ${r.TEST_FILE}`);
	assert("test file path", r.TEST_FILE && r.TEST_FILE.includes("sap.m"), `Test file should be in sap.m: ${r.TEST_FILE}`);
	assert("URL contains test=Button", r.TEST_URL && r.TEST_URL.includes("test=Button"), `URL should contain test=Button: ${r.TEST_URL}`);
});

test("Button — bare name, multiple matches", () => {
	const r = run("Button");
	const count = parseInt(r.MATCHES, 10);
	assert("multiple matches", count > 1, `Expected >1 matches, got ${count}`);

	const libraries = r._matches.map((m) => m.LIBRARY);
	assert("includes sap.m", libraries.includes("sap.m"), `Should include sap.m, got: ${libraries}`);

	// Each match should have a valid URL
	for (const m of r._matches) {
		assert(`match ${m.TEST_KEY} has URL`, m.TEST_URL && m.TEST_URL.startsWith("http"), `Missing URL for ${m.TEST_KEY}`);
	}
});

test("sap.ui.core.Element — testsuite-only entry (no .qunit.js file)", () => {
	const r = run("sap.ui.core.Element");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key", r.TEST_KEY === "Element", `Expected key Element, got ${r.TEST_KEY}`);
	assert("test file is null", r.TEST_FILE === "null", `Expected null test file for fallback match, got ${r.TEST_FILE}`);
	assert("URL contains test=Element", r.TEST_URL && r.TEST_URL.includes("test=Element"), `URL should contain test=Element: ${r.TEST_URL}`);
});

test("Popup — ambiguous bare name, finds both libraries", () => {
	const r = run("Popup");
	const count = parseInt(r.MATCHES, 10);
	assert("multiple matches", count >= 2, `Expected >=2 matches, got ${count}`);

	const libraries = r._matches.map((m) => m.LIBRARY);
	assert("includes sap.m", libraries.includes("sap.m"), `Should include sap.m, got: ${libraries}`);
	assert("includes sap.ui.core", libraries.includes("sap.ui.core"), `Should include sap.ui.core, got: ${libraries}`);

	// sap.m match should use dot-notation key (p13n.Popup)
	const sapM = r._matches.find((m) => m.LIBRARY === "sap.m");
	assert("sap.m key is p13n.Popup", sapM && sapM.TEST_KEY === "p13n.Popup", `Expected p13n.Popup, got ${sapM && sapM.TEST_KEY}`);

	// sap.ui.core match should have individual_page URL type (has page: override)
	const core = r._matches.find((m) => m.LIBRARY === "sap.ui.core");
	assert("core URL type", core && core.URL_TYPE === "individual_page", `Expected individual_page, got ${core && core.URL_TYPE}`);
	assert("core URL is .html", core && core.TEST_URL && core.TEST_URL.includes("Popup.qunit.html"), `URL should contain Popup.qunit.html: ${core && core.TEST_URL}`);
});

test("sap.ui.core.routing.Router — defaults.page with {name} placeholder", () => {
	const r = run("sap.ui.core.routing.Router");
	const count = parseInt(r.MATCHES, 10);
	assert("matches found", count >= 1, `Expected >=1 matches, got ${count}`);

	// Should find async/Router and possibly sync/Router
	const async = r._matches.find((m) => m.TEST_KEY === "async/Router");
	assert("async/Router found", !!async, `Expected to find async/Router key`);
	assert("URL type is defaults_page", async && async.URL_TYPE === "defaults_page", `Expected defaults_page, got ${async && async.URL_TYPE}`);
	assert("URL has test=async/Router", async && async.TEST_URL && async.TEST_URL.includes("test=async/Router"), `URL should contain test=async/Router: ${async && async.TEST_URL}`);
	assert("no literal {name}", async && async.TEST_URL && !async.TEST_URL.includes("{name}"), `URL should not contain literal {name}: ${async && async.TEST_URL}`);
});

test("BlockLayerUtils — direct qunit file in qunit/ root", () => {
	const r = run("BlockLayerUtils");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key", r.TEST_KEY === "BlockLayerUtils", `Expected key BlockLayerUtils, got ${r.TEST_KEY}`);
	assert("test file found", r.TEST_FILE && r.TEST_FILE !== "null", `Expected test file, got ${r.TEST_FILE}`);
});

test("sap.ui.rta.RuntimeAuthoring — behind bCompAvailable conditional, not resolved by name", () => {
	// RuntimeAuthoring is inside `if (bCompAvailable) { merge(...) }` in the rta testsuite.
	// The VM correctly excludes it (sap.ui.comp unavailable in OpenUI5). The test file exists
	// and runs fine, but it's not in the testsuite listing. Use file path input instead.
	const r = run("sap.ui.rta.RuntimeAuthoring");
	assert("not found by name", r.ERROR && r.ERROR.includes("No test found"),
		`Expected no match (comp-conditional), got: ${r._raw.substring(0, 200)}`);
});

test("sap.ui.rta.startKeyUserAdaptation — defaults.page with {suite} and {name} placeholders", () => {
	const r = run("sap.ui.rta.startKeyUserAdaptation");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.rta", `Expected sap.ui.rta, got ${r.LIBRARY}`);
	assert("URL type", r.URL_TYPE === "defaults_page", `Expected defaults_page, got ${r.URL_TYPE}`);
	assert("no literal {suite}", r.TEST_URL && !r.TEST_URL.includes("{suite}"), `URL should not contain literal {suite}: ${r.TEST_URL}`);
	assert("no literal {name}", r.TEST_URL && !r.TEST_URL.includes("{name}"), `URL should not contain literal {name}: ${r.TEST_URL}`);
	assert("URL has testsuite=", r.TEST_URL && r.TEST_URL.includes("testsuite="), `URL should contain testsuite= param: ${r.TEST_URL}`);
	assert("URL has test=", r.TEST_URL && r.TEST_URL.includes("test=api/startKeyUserAdaptation"), `URL should contain test=api/startKeyUserAdaptation: ${r.TEST_URL}`);
});

test("sap/ui/core/routing/Router — slash notation input", () => {
	const r = run("sap/ui/core/routing/Router");
	const count = parseInt(r.MATCHES, 10);
	assert("matches found", count >= 1, `Expected >=1 matches, got ${count}`);
	const async = r._matches.find((m) => m.TEST_KEY === "async/Router");
	assert("async/Router found", !!async, `Expected to find async/Router (same as dot notation)`);
});

test("xmltemplateprocessor — case-insensitive: all lowercase", () => {
	const r = run("xmltemplateprocessor");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key preserves real case", r.TEST_KEY === "XMLTemplateProcessor", `Expected key XMLTemplateProcessor, got ${r.TEST_KEY}`);
	assert("URL uses correct case", r.TEST_URL && r.TEST_URL.includes("test=XMLTemplateProcessor"), `URL should use correct case: ${r.TEST_URL}`);
});

test("BUTTON — case-insensitive: all uppercase", () => {
	const r = run("BUTTON");
	const count = parseInt(r.MATCHES, 10);
	assert("matches found", count >= 1, `Expected >=1 matches, got ${count}`);
	const sapM = r._matches.find((m) => m.LIBRARY === "sap.m");
	assert("sap.m match found", !!sapM, `Expected sap.m match`);
	assert("test key preserves real case", sapM && sapM.TEST_KEY === "Button", `Expected key Button, got ${sapM && sapM.TEST_KEY}`);
	assert("URL uses correct case", sapM && sapM.TEST_URL && sapM.TEST_URL.includes("test=Button"), `URL should use correct case: ${sapM && sapM.TEST_URL}`);
});

test("sap.m.button — case-insensitive: qualified lowercase", () => {
	const r = run("sap.m.button");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.m", `Expected sap.m, got ${r.LIBRARY}`);
	assert("test key preserves real case", r.TEST_KEY === "Button", `Expected key Button, got ${r.TEST_KEY}`);
	assert("URL uses correct case", r.TEST_URL && r.TEST_URL.includes("test=Button"), `URL should use correct case: ${r.TEST_URL}`);
});

test("blocklayerutils — case-insensitive: all lowercase bare name", () => {
	const r = run("blocklayerutils");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key preserves real case", r.TEST_KEY === "BlockLayerUtils", `Expected key BlockLayerUtils, got ${r.TEST_KEY}`);
});

test("sap.m.FakeWidget — non-existent module", () => {
	const r = run("sap.m.FakeWidget");
	assert("error output", r.ERROR && r.ERROR.includes("No test found"), `Expected error, got: ${r._raw.substring(0, 200)}`);
});

test("sap.ui.core.Control — known non-match (test key is ControlDefinition)", () => {
	const r = run("sap.ui.core.Control");
	// Control has no matching testsuite key (it's registered as "ControlDefinition")
	assert("error output", r.ERROR && r.ERROR.includes("No test found"), `Expected no match for Control: ${r._raw.substring(0, 200)}`);
});

// --- Module array resolution tests ---

test("Element_focus — module array entry resolves to parent key Element", () => {
	const r = run("Element_focus");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key is parent", r.TEST_KEY === "Element", `Expected parent key Element, got ${r.TEST_KEY}`);
	assert("URL contains test=Element", r.TEST_URL && r.TEST_URL.includes("test=Element"), `URL should contain test=Element: ${r.TEST_URL}`);
	assert("URL does NOT contain Element_focus", r.TEST_URL && !r.TEST_URL.includes("Element_focus"), `URL should not contain Element_focus: ${r.TEST_URL}`);
});

test("sap.ui.core.Element_focus — qualified module array entry", () => {
	const r = run("sap.ui.core.Element_focus");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key is parent", r.TEST_KEY === "Element", `Expected parent key Element, got ${r.TEST_KEY}`);
});

test("element_focus — case-insensitive module array lookup", () => {
	const r = run("element_focus");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("test key is parent", r.TEST_KEY === "Element", `Expected parent key Element, got ${r.TEST_KEY}`);
});

test("Element_base — another module array entry in same parent", () => {
	const r = run("Element_base");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key is parent", r.TEST_KEY === "Element", `Expected parent key Element, got ${r.TEST_KEY}`);
});

test("GridDropInfo — direct key wins over module array entry", () => {
	const r = run("GridDropInfo");
	const count = parseInt(r.MATCHES, 10);
	assert("matches found", count >= 1, `Expected >=1 matches, got ${count}`);
	// Should resolve via direct key match, not module array fallback
	const sapF = r._matches.find((m) => m.LIBRARY === "sap.f");
	assert("sap.f match found", !!sapF, `Expected sap.f match`);
	assert("key is GridDropInfo", sapF && sapF.TEST_KEY === "GridDropInfo", `Expected key GridDropInfo, got ${sapF && sapF.TEST_KEY}`);
});

test("GridKeyboardDragAndDrop — module array entry in sap.f resolves to parent", () => {
	const r = run("GridKeyboardDragAndDrop");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.f", `Expected sap.f, got ${r.LIBRARY}`);
	assert("test key is parent", r.TEST_KEY === "GridDropInfo", `Expected parent key GridDropInfo, got ${r.TEST_KEY}`);
});

// --- Deduplication tests ---

test("Button — ambiguous matches are deduplicated (no duplicate lib+key)", () => {
	const r = run("Button");
	const count = parseInt(r.MATCHES, 10);
	assert("has matches", count >= 2, `Expected >=2 matches, got ${count}`);
	// Check no duplicate lib+key pairs
	const seen = new Set();
	let hasDupes = false;
	for (const m of r._matches) {
		const k = `${m.LIBRARY}:${m.TEST_KEY}`;
		if (seen.has(k)) { hasDupes = true; break; }
		seen.add(k);
	}
	assert("no duplicate lib+key", !hasDupes, `Found duplicate lib+key in matches: ${r._matches.map(m => `${m.LIBRARY}:${m.TEST_KEY}`).join(", ")}`);
});

// --- File path input tests ---

test("file path: src/sap.ui.core/.../BlockLayerUtils.qunit.js", () => {
	const r = run("src/sap.ui.core/test/sap/ui/core/qunit/BlockLayerUtils.qunit.js");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key", r.TEST_KEY === "BlockLayerUtils", `Expected key BlockLayerUtils, got ${r.TEST_KEY}`);
	assert("URL contains test=BlockLayerUtils", r.TEST_URL && r.TEST_URL.includes("test=BlockLayerUtils"), `URL should contain test=BlockLayerUtils: ${r.TEST_URL}`);
});

test("file path: src/sap.ui.core/.../Element_focus.qunit.js — module array via file path", () => {
	const r = run("src/sap.ui.core/test/sap/ui/core/qunit/Element_focus.qunit.js");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key is parent", r.TEST_KEY === "Element", `Expected parent key Element, got ${r.TEST_KEY}`);
});

test("file path: src/sap.ui.table/.../extensions/KeyboardDelegate.qunit.js — subdirectory key", () => {
	const r = run("src/sap.ui.table/test/sap/ui/table/qunit/extensions/KeyboardDelegate.qunit.js");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.table", `Expected sap.ui.table, got ${r.LIBRARY}`);
	assert("test key", r.TEST_KEY === "KeyboardDelegate", `Expected key KeyboardDelegate, got ${r.TEST_KEY}`);
});

test("file path: src/sap.ui.core/.../LocalBusyIndicator.qunit.js", () => {
	const r = run("src/sap.ui.core/test/sap/ui/core/qunit/LocalBusyIndicator.qunit.js");
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key", r.TEST_KEY === "LocalBusyIndicator", `Expected key LocalBusyIndicator, got ${r.TEST_KEY}`);
});

test("file path: absolute path resolves same as relative", () => {
	const abs = path.join(REPO_ROOT, "src/sap.ui.core/test/sap/ui/core/qunit/BlockLayerUtils.qunit.js");
	const r = run(abs);
	assert("matches", r.MATCHES === "1", `Expected 1 match, got ${r.MATCHES}`);
	assert("library", r.LIBRARY === "sap.ui.core", `Expected sap.ui.core, got ${r.LIBRARY}`);
	assert("test key", r.TEST_KEY === "BlockLayerUtils", `Expected key BlockLayerUtils, got ${r.TEST_KEY}`);
});

// --- Summary ---

console.log("\n" + "=".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
	console.log("\nFailures:");
	for (const f of failures) {
		console.log(`  [${f.testName}] ${f.detail}`);
	}
}
console.log("=".repeat(50));
process.exit(failed > 0 ? 1 : 0);
