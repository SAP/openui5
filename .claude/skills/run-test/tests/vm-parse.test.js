#!/usr/bin/env node
/**
 * Unit tests for the VM-based testsuite parser in find-test-url.js.
 *
 * These tests exercise vmParseTestsuite(), extractParsedResult(), and
 * deepMerge() directly with synthetic inputs — no dev server required.
 *
 * Run from the openui5 repo root:
 *   node .claude/skills/run-test/tests/vm-parse.test.js
 */

const assert = require("assert");
const vm = require("vm");
const path = require("path");
const fs = require("fs");

// Since find-test-url.js doesn't export these functions, we replicate them
// here for unit testing. The integration tests in find-test-url.test.js
// verify the full pipeline including these functions.

function deepMerge(target, ...sources) {
	for (const src of sources) {
		if (!src || typeof src !== "object") continue;
		for (const [k, v] of Object.entries(src)) {
			if (v && typeof v === "object" && !Array.isArray(v) && target[k] && typeof target[k] === "object") {
				deepMerge(target[k], v);
			} else {
				target[k] = v;
			}
		}
	}
	return target;
}

function deepStub() {
	return new Proxy(function() { return false; }, {
		get: (_, prop) => prop === Symbol.toPrimitive ? () => "" : deepStub(),
		apply: (_, __, args) => {
			const objs = args.filter(a => a && typeof a === "object" && !Array.isArray(a));
			if (objs.length === 0) return false;
			return deepMerge({}, ...objs);
		}
	});
}

function StubXHR() { this.status = 0; this.responseText = "{}"; }
StubXHR.prototype.open = function() {};
StubXHR.prototype.send = function() {};

function moduleEntryToBareName(entry) {
	return path.basename(entry).replace(/\.qunit$/, "");
}

function vmParseTestsuite(src, filename) {
	let config = null;
	const sandbox = {
		sap: { ui: {
			define: function(depsOrFactory, factory) {
				const fn = typeof depsOrFactory === "function" ? depsOrFactory : factory;
				if (typeof fn !== "function") return;
				try { config = fn(...Array(fn.length).fill(deepStub())); } catch {}
			},
			require: Object.assign(deepStub(), { toUrl: () => "" })
		}},
		XMLHttpRequest: StubXHR,
		JSON: JSON,
		Object: Object,
		Array: Array,
		parseInt: parseInt,
		parseFloat: parseFloat,
		console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {} },
		window: deepStub(),
		self: deepStub(),
		parent: deepStub(),
		top: deepStub(),
		document: deepStub(),
		location: deepStub(),
		navigator: deepStub(),
		setTimeout: deepStub(),
		clearTimeout: deepStub()
	};
	try { vm.runInNewContext(src, sandbox, { filename: filename || "test.js", timeout: 5000 }); } catch {}
	return config;
}

function extractParsedResult(config) {
	if (!config || typeof config !== "object") return null;
	let defaultsPage = null;
	const defaults = config.defaults;
	if (defaults && typeof defaults.page === "string") {
		defaultsPage = defaults.page;
	}
	const tests = {};
	if (config.tests && typeof config.tests === "object") {
		for (const [key, entry] of Object.entries(config.tests)) {
			if (!entry || typeof entry !== "object") continue;
			let page = null;
			if (typeof entry.page === "string") page = entry.page;
			let modules = null;
			if (Array.isArray(entry.module)) {
				const entries = entry.module.filter(m => typeof m === "string").map(moduleEntryToBareName);
				if (entries.length > 0) modules = entries;
			} else if (typeof entry.module === "string") {
				modules = [moduleEntryToBareName(entry.module)];
			}
			tests[key] = { page, modules };
		}
	}
	if (Object.keys(tests).length === 0 && config.tests) return null;
	return { defaultsPage, tests };
}

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

// ── deepMerge ──────────────────────────────────────────────────────

console.log("deepMerge");

test("merges nested objects recursively", () => {
	const result = deepMerge({}, { a: { x: 1 } }, { a: { y: 2 } });
	assert.deepStrictEqual(result, { a: { x: 1, y: 2 } });
});

test("replaces arrays (does not merge them)", () => {
	const result = deepMerge({}, { a: [1, 2] }, { a: [3] });
	assert.deepStrictEqual(result, { a: [3] });
});

test("replaces primitives", () => {
	const result = deepMerge({}, { a: 1 }, { a: 2, b: "x" });
	assert.deepStrictEqual(result, { a: 2, b: "x" });
});

test("skips null/non-object sources", () => {
	const result = deepMerge({ a: 1 }, null, undefined, "string", { b: 2 });
	assert.deepStrictEqual(result, { a: 1, b: 2 });
});

// ── deepStub ───────────────────────────────────────────────────────

console.log("\ndeepStub");

test("property access returns another stub (falsy for === comparison)", () => {
	const stub = deepStub();
	assert.strictEqual(stub.foo.bar.baz === 200, false);
	assert.strictEqual(stub.status === 4, false);
});

test("function call with no object args returns false", () => {
	const stub = deepStub();
	assert.strictEqual(stub(), false);
	assert.strictEqual(stub("string", 42), false);
});

test("function call with object args deep-merges them", () => {
	const stub = deepStub();
	const result = stub({}, { tests: { A: { page: "x" } } }, { tests: { B: { page: "y" } } });
	assert.strictEqual(result.tests.A.page, "x");
	assert.strictEqual(result.tests.B.page, "y");
});

test("Symbol.toPrimitive returns empty string", () => {
	const stub = deepStub();
	assert.strictEqual(`${stub}`, "");
});

// ── StubXHR ────────────────────────────────────────────────────────

console.log("\nStubXHR — XHR conditional pattern");

test("onreadystatechange check this.readyState === 4 fails", () => {
	// Simulates the testsuite XHR pattern
	let bCompAvailable = false;
	const xhr = new StubXHR();
	xhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			bCompAvailable = true;
		}
	};
	xhr.open("GET", "sap-ui-version.json", false);
	xhr.send();
	// onreadystatechange is never called by send(), so bCompAvailable stays false
	assert.strictEqual(bCompAvailable, false,
		"XHR stub must keep conditional false (readyState never reaches 4)");
});

// ── vmParseTestsuite ───────────────────────────────────────────────

console.log("\nvmParseTestsuite — synthetic inputs");

test("simple config with no dependencies", () => {
	const src = `sap.ui.define(function() {
		return {
			defaults: { page: "test-resources/foo/Test.qunit.html?test={name}" },
			tests: {
				Button: { },
				Table: { page: "custom/Table.qunit.html" }
			}
		};
	});`;
	const config = vmParseTestsuite(src);
	assert.ok(config, "config should not be null");
	assert.strictEqual(config.defaults.page, "test-resources/foo/Test.qunit.html?test={name}");
	assert.ok(config.tests.Button, "Button test should exist");
	assert.strictEqual(config.tests.Table.page, "custom/Table.qunit.html");
});

test("config with module array", () => {
	const src = `sap.ui.define(function() {
		return {
			tests: {
				Element: {
					module: [
						"./Element_base.qunit",
						"./Element_focus.qunit",
						"./Element_data.qunit"
					]
				}
			}
		};
	});`;
	const config = vmParseTestsuite(src);
	assert.ok(config);
	assert.ok(Array.isArray(config.tests.Element.module));
	assert.strictEqual(config.tests.Element.module.length, 3);
	assert.strictEqual(config.tests.Element.module[0], "./Element_base.qunit");
});

test("config with merge() conditional — merge dependency is deepStub", () => {
	// Simulates: sap.ui.define(["sap/base/util/merge"], function(merge) { ... })
	const src = `sap.ui.define(["sap/base/util/merge"], function(merge) {
		var config = {
			tests: {
				AlwaysPresent: { page: "a.html" }
			}
		};
		var flag = false;
		if (flag) {
			config = merge({}, config, { tests: { ConditionalTest: { page: "b.html" } } });
		}
		return config;
	});`;
	const config = vmParseTestsuite(src);
	assert.ok(config);
	assert.ok(config.tests.AlwaysPresent, "static test should be present");
	assert.ok(!config.tests.ConditionalTest, "conditional test should NOT be present (flag=false)");
});

test("config with merge() — flag true includes conditional tests", () => {
	const src = `sap.ui.define(["sap/base/util/merge"], function(merge) {
		var config = {
			tests: {
				AlwaysPresent: { page: "a.html" }
			}
		};
		var flag = true;
		if (flag) {
			config = merge({}, config, { tests: { ConditionalTest: { page: "b.html" } } });
		}
		return config;
	});`;
	const config = vmParseTestsuite(src);
	assert.ok(config);
	assert.ok(config.tests.AlwaysPresent);
	assert.ok(config.tests.ConditionalTest, "conditional test should be present (flag=true)");
	assert.strictEqual(config.tests.ConditionalTest.page, "b.html");
});

test("Object.entries iteration — creates derived keys", () => {
	const src = `sap.ui.define(["sap/base/util/merge"], function(merge) {
		var config = {
			defaults: { module: "./{name}.qunit" },
			tests: { Press: {}, Click: {} }
		};
		for (var [name, tc] of Object.entries(config.tests)) {
			config.tests[name + "1"] = merge({}, tc, { qunit: { version: 1 } });
			config.tests[name + "2"] = merge({}, tc, { qunit: { version: 2 } });
			delete config.tests[name];
		}
		return config;
	});`;
	const config = vmParseTestsuite(src);
	assert.ok(config);
	assert.ok(!config.tests.Press, "original key should be deleted");
	assert.ok(config.tests.Press1, "versioned key Press1 should exist");
	assert.ok(config.tests.Press2, "versioned key Press2 should exist");
	assert.ok(config.tests.Click1, "versioned key Click1 should exist");
	assert.ok(config.tests.Click2, "versioned key Click2 should exist");
});

test("timeout on infinite loop returns null", () => {
	const src = `sap.ui.define(function() { while(true) {} });`;
	// Should not hang — vm.runInNewContext has 5s timeout, but we use a shorter one here
	const config = vmParseTestsuite(src);
	assert.strictEqual(config, null, "infinite loop should result in null (timeout)");
});

test("syntax error returns null", () => {
	const config = vmParseTestsuite("this is not valid javascript {{{");
	assert.strictEqual(config, null);
});

test("non-AMD file returns null", () => {
	const config = vmParseTestsuite("var x = 42;");
	assert.strictEqual(config, null);
});

// ── extractParsedResult ────────────────────────────────────────────

console.log("\nextractParsedResult");

test("extracts defaultsPage and test entries", () => {
	const config = {
		defaults: { page: "test.html?test={name}", qunit: { version: 2 } },
		tests: {
			Button: { page: "custom.html" },
			Table: { module: ["./Table_basic.qunit", "./Table_sort.qunit"] },
			Input: { module: "./Input.qunit" },
			Simple: {}
		}
	};
	const result = extractParsedResult(config);
	assert.ok(result);
	assert.strictEqual(result.defaultsPage, "test.html?test={name}");
	assert.strictEqual(result.tests.Button.page, "custom.html");
	assert.deepStrictEqual(result.tests.Table.modules, ["Table_basic", "Table_sort"]);
	assert.deepStrictEqual(result.tests.Input.modules, ["Input"]);
	assert.strictEqual(result.tests.Simple.page, null);
	assert.strictEqual(result.tests.Simple.modules, null);
});

test("returns null for null/undefined config", () => {
	assert.strictEqual(extractParsedResult(null), null);
	assert.strictEqual(extractParsedResult(undefined), null);
	assert.strictEqual(extractParsedResult("string"), null);
});

test("returns null when config.tests exists but no real entries extracted", () => {
	// Simulates GenericTestCollection — config has .tests but it's a Proxy
	const config = { tests: deepStub() };
	const result = extractParsedResult(config);
	assert.strictEqual(result, null, "Proxy tests should yield null (fallback to regex)");
});

test("Proxy entries are skipped (typeof Proxy is 'function', not 'object')", () => {
	// Simulates imported testsuite where test values are Proxies.
	// deepStub() creates a Proxy around a function, so typeof is "function".
	// extractParsedResult skips non-object entries — this is correct because
	// Proxy values have no useful page/module data.
	const config = {
		tests: {
			RealTest: { page: "real.html" },
			ProxyTest: deepStub()
		}
	};
	const result = extractParsedResult(config);
	assert.ok(result);
	assert.strictEqual(result.tests.RealTest.page, "real.html");
	assert.ok(!result.tests.ProxyTest, "Proxy entry should be skipped (typeof is function)");
});

// ── Real testsuite files (if available) ────────────────────────────

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

console.log("\nReal testsuite files");

test("sap.ui.core control.framework testsuite — Element entry has module array", () => {
	const filePath = path.join(REPO_ROOT, "src/sap.ui.core/test/sap/ui/core/qunit/testsuites/testsuite.control.framework.qunit.js");
	if (!fs.existsSync(filePath)) { console.log("    SKIP (file not found)"); passed--; return; }
	const src = fs.readFileSync(filePath, "utf8");
	const config = vmParseTestsuite(src, filePath);
	assert.ok(config, "VM should produce a config");
	assert.ok(config.tests.Element, "Element key should exist");
	assert.ok(Array.isArray(config.tests.Element.module), "Element should have module array");
	assert.ok(config.tests.Element.module.some(m => m.includes("Element_focus")),
		"module array should include Element_focus");
	assert.ok(config.tests.BlockLayerUtils, "BlockLayerUtils key should exist");
});

test("sap.m mobile testsuite — large file with XHR conditional", () => {
	const filePath = path.join(REPO_ROOT, "src/sap.m/test/sap/m/qunit/testsuite.mobile.qunit.js");
	if (!fs.existsSync(filePath)) { console.log("    SKIP (file not found)"); passed--; return; }
	const src = fs.readFileSync(filePath, "utf8");
	const config = vmParseTestsuite(src, filePath);
	assert.ok(config, "VM should produce a config");
	const keyCount = Object.keys(config.tests).length;
	assert.ok(keyCount > 100, `Should have >100 test keys, got ${keyCount}`);
	assert.ok(config.tests.Button, "Button should be present");
	// bCompAvailable is false (XHR stub) → conditional tests excluded
	assert.ok(!config.tests["changeHandler/AddTableColumn"],
		"conditional sap.ui.comp test should NOT be present (XHR stub → bCompAvailable=false)");
});

test("sap.ui.rta testsuite — defaults.page with {suite} and {name} placeholders", () => {
	const filePath = path.join(REPO_ROOT, "src/sap.ui.rta/test/sap/ui/rta/qunit/testsuite.qunit.js");
	if (!fs.existsSync(filePath)) { console.log("    SKIP (file not found)"); passed--; return; }
	const src = fs.readFileSync(filePath, "utf8");
	const config = vmParseTestsuite(src, filePath);
	assert.ok(config, "VM should produce a config");
	assert.ok(config.defaults.page.includes("{suite}"), "defaults.page should contain {suite}");
	assert.ok(config.defaults.page.includes("{name}"), "defaults.page should contain {name}");
	const keyCount = Object.keys(config.tests).length;
	assert.ok(keyCount > 50, `Should have >50 test keys, got ${keyCount}`);
});

test("sap.ui.core OPA testsuite — Object.entries iteration creates versioned keys", () => {
	const filePath = path.join(REPO_ROOT, "src/sap.ui.core/test/sap/ui/core/qunit/opa/testsuite.opa.qunit.js");
	if (!fs.existsSync(filePath)) { console.log("    SKIP (file not found)"); passed--; return; }
	const src = fs.readFileSync(filePath, "utf8");
	const config = vmParseTestsuite(src, filePath);
	assert.ok(config, "VM should produce a config");
	const keys = Object.keys(config.tests);
	const versioned = keys.filter(k => /[12]$/.test(k));
	assert.ok(versioned.length > 10,
		`Should have versioned keys (e.g. Press1, Press2), got ${versioned.length}`);
	// Original unversioned keys should be deleted by the iteration
	assert.ok(!config.tests["actions/Press"],
		"original unversioned key should be deleted");
	assert.ok(config.tests["actions/Press1"] || config.tests["actions/Press2"],
		"versioned key should exist");
});

// ── Summary ────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
