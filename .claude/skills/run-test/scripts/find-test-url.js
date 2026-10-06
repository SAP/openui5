#!/usr/bin/env node
/**
 * find-test-url.js - Finds QUnit test URL for an OpenUI5 module in one shot.
 *
 * Usage: node find-test-url.js <module_name> [repo_root]
 *
 * Examples:
 *   node find-test-url.js Button
 *   node find-test-url.js sap.m.Button
 *   node find-test-url.js sap/ui/core/routing/Router
 *   node find-test-url.js BlockLayerUtils
 *   node find-test-url.js Popup
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const vm = require("vm");

const moduleInput = process.argv[2];
if (!moduleInput) {
	console.error("Usage: node find-test-url.js <module_name> [repo_root]");
	process.exit(1);
}
const repoRoot = toForwardSlash(process.argv[3] || process.cwd());

// --- 1. Detect dev server port ---
function checkPort(port) {
	return new Promise((resolve) => {
		const req = http.get(
			`http://localhost:${port}/resources/sap-ui-version.json`,
			{ timeout: 2000 },
			(res) => {
				if (res.statusCode !== 200) {
					res.resume();
					resolve(null);
					return;
				}
				const chunks = [];
				res.on("data", (chunk) => chunks.push(chunk));
				res.on("end", () => {
					try {
						const json = JSON.parse(Buffer.concat(chunks).toString());
						resolve(json.name === "openui5-testsuite" ? port : null);
					} catch {
						resolve(null);
					}
				});
			}
		);
		req.on("error", () => resolve(null));
		req.on("timeout", () => {
			req.destroy();
			resolve(null);
		});
	});
}

// Normalize path separators to forward slashes for cross-platform consistency
function toForwardSlash(p) {
	return p.replace(/\\/g, "/");
}

// --- 2. Recursive file search ---
// All returned paths use forward slashes. Node.js fs accepts forward slashes on all platforms.
function findFiles(dir, namePattern, opts = {}) {
	const results = [];
	if (!fs.existsSync(dir)) return results;

	function walk(d) {
		let entries;
		try {
			entries = fs.readdirSync(d, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			const full = d + "/" + entry.name;
			if (entry.isDirectory()) {
				if (entry.name === "dist" || entry.name === "node_modules") continue;
				if (opts.excludeDemokit && entry.name === "demokit") continue;
				walk(full);
			} else if (entry.isFile() && namePattern.test(entry.name)) {
				if (opts.mustBeUnderQunit && !full.includes("/qunit/")) continue;
				results.push(full);
			}
		}
	}
	walk(toForwardSlash(dir));
	return results;
}

// --- 3. Parse testsuite JS to extract defaults.page and test entries ---

// VM-based evaluation helpers.
// Execute testsuite AMD modules in a sandboxed Node.js VM context,
// correctly handling conditional merges, programmatic iteration, and XHR checks.

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

/**
 * Execute a testsuite file in a sandboxed VM and return the raw config object.
 * Returns null on any failure (file not found, parse error, timeout, etc.).
 */
function vmParseTestsuite(filePath) {
	let src;
	try { src = fs.readFileSync(filePath, "utf8"); } catch { return null; }
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

	try { vm.runInNewContext(src, sandbox, { filename: filePath, timeout: 5000 }); } catch {}
	return config;
}

/**
 * Transform a raw VM config object into the shape expected by callers:
 * { defaultsPage: string|null, tests: { [key]: { page: string|null, modules: string[]|null } } }
 *
 * Returns null if the config is unusable (not an object, no real test entries).
 */
function extractParsedResult(config) {
	if (!config || typeof config !== "object") return null;

	// defaultsPage — must be a real string, not a Proxy
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

	// Empty tests when config.tests existed → GenericTestCollection or similar failure
	if (Object.keys(tests).length === 0 && config.tests) return null;
	return { defaultsPage, tests };
}

const parseCache = new Map();
function parseTestsuite(filePath) {
	if (parseCache.has(filePath)) return parseCache.get(filePath);

	// Try VM-based evaluation first (handles merge(), conditionals, iteration)
	const vmConfig = vmParseTestsuite(filePath);
	const vmResult = extractParsedResult(vmConfig);
	if (vmResult && Object.keys(vmResult.tests).length > 0) {
		parseCache.set(filePath, vmResult);
		return vmResult;
	}

	// VM failed (GenericTestCollection, imported testsuites, etc.) — fall back to regex
	const regexResult = regexParseTestsuite(filePath);
	parseCache.set(filePath, regexResult);
	return regexResult;
}

function regexParseTestsuite(filePath) {
	const content = fs.readFileSync(filePath, "utf8");

	// Extract defaults.page using brace-walking to handle nested objects
	// (e.g., qunit: { version: 2 }, ui5: { ... }) that appear before page:
	let defaultsPage = null;
	const defaultsStart = content.match(/defaults\s*:\s*\{/);
	if (defaultsStart) {
		let depth = 1;
		let i = defaultsStart.index + defaultsStart[0].length;
		const defaultsBody = [];
		while (i < content.length && depth > 0) {
			if (content[i] === "{") depth++;
			if (content[i] === "}") depth--;
			if (depth > 0) defaultsBody.push(content[i]);
			i++;
		}
		const defaultsText = defaultsBody.join("");
		// Find page: at the top level of defaults (depth 0 relative to defaults body)
		let pDepth = 0;
		for (const line of defaultsText.split("\n")) {
			if (pDepth <= 0) {
				const pageMatch = line.match(/page\s*:\s*["']([^"']+)["']/);
				if (pageMatch) {
					defaultsPage = pageMatch[1];
					break;
				}
			}
			let inStr = null;
			for (const ch of line) {
				if (inStr) {
					if (ch === inStr) inStr = null;
				} else if (ch === '"' || ch === "'") {
					inStr = ch;
				} else if (ch === "{") {
					pDepth++;
				} else if (ch === "}") {
					pDepth--;
				}
			}
		}
	}

	// Extract test keys and their individual page overrides
	// We look for keys inside the tests: { ... } block
	const testsBlockMatch = content.match(/tests\s*:\s*\{([\s\S]*)\}\s*;?\s*\}?\s*;?\s*\}?\s*\)?\s*;?\s*$/);
	if (!testsBlockMatch) return { defaultsPage, tests: {} };

	const testsBlock = testsBlockMatch[1];
	const tests = {};

	// Match test entries: "key": { ... } or key: { ... }
	// Use a state-machine approach to handle nested braces
	const keyPattern = /(?:["']([^"']+)["']|([A-Za-z_]\w*))\s*:\s*\{/g;
	let match;
	while ((match = keyPattern.exec(testsBlock)) !== null) {
		const key = match[1] || match[2];
		// Skip known non-test keys that appear as nested objects
		if (["qunit", "sinon", "ui5", "coverage", "loader", "paths"].includes(key)) continue;

		// Find the matching closing brace for this test entry
		let depth = 1;
		let i = match.index + match[0].length;
		while (i < testsBlock.length && depth > 0) {
			if (testsBlock[i] === "{") depth++;
			if (testsBlock[i] === "}") depth--;
			i++;
		}
		const testBody = testsBlock.substring(match.index + match[0].length, i - 1);

		// Check for individual page: override in this test's body
		// Only match top-level page: (not inside nested objects like ui5: { ... })
		let page = null;
		let pageDepth = 0;
		const lines = testBody.split("\n");
		for (const line of lines) {
			// Check for page: BEFORE counting braces on this line,
			// so that braces inside string values (e.g., {name}, {suite})
			// don't corrupt the depth check
			if (pageDepth <= 0) {
				const pageMatch = line.match(/page\s*:\s*["']([^"']+)["']/);
				if (pageMatch) {
					page = pageMatch[1];
					break;
				}
			}
			// Count braces outside of string literals
			let inStr = null;
			for (const ch of line) {
				if (inStr) {
					if (ch === inStr) inStr = null;
				} else if (ch === '"' || ch === "'") {
					inStr = ch;
				} else if (ch === "{") {
					pageDepth++;
				} else if (ch === "}") {
					pageDepth--;
				}
			}
		}

		// Extract module: property (string or array) at the top level of the test body.
		// This lists sub-test files that are loaded together under this parent key.
		let modules = null;
		let modDepth = 0;
		for (const line of lines) {
			if (modDepth <= 0) {
				// module: [...] (array form)
				const arrMatch = line.match(/module\s*:\s*\[/);
				if (arrMatch) {
					// Collect the full array content, may span multiple lines
					const arrStart = testBody.indexOf(line) + arrMatch.index + arrMatch[0].length;
					let bracketDepth = 1;
					let j = arrStart;
					while (j < testBody.length && bracketDepth > 0) {
						if (testBody[j] === "[") bracketDepth++;
						if (testBody[j] === "]") bracketDepth--;
						j++;
					}
					const arrContent = testBody.substring(arrStart, j - 1);
					// Extract quoted strings from the array
					const entries = [];
					const strPattern = /["']([^"']+)["']/g;
					let strMatch;
					while ((strMatch = strPattern.exec(arrContent)) !== null) {
						entries.push(moduleEntryToBareName(strMatch[1]));
					}
					if (entries.length > 0) modules = entries;
					break;
				}
				// module: "..." (string form)
				const strModMatch = line.match(/module\s*:\s*["']([^"']+)["']/);
				if (strModMatch) {
					modules = [moduleEntryToBareName(strModMatch[1])];
					break;
				}
			}
			// Track brace depth (same approach as page extraction)
			let inStr = null;
			for (const ch of line) {
				if (inStr) {
					if (ch === inStr) inStr = null;
				} else if (ch === '"' || ch === "'") {
					inStr = ch;
				} else if (ch === "{") {
					modDepth++;
				} else if (ch === "}") {
					modDepth--;
				}
			}
		}

		tests[key] = { page, modules };
	}

	const result = { defaultsPage, tests };
	return result;
}

// --- Main ---
async function main() {
	// 1. Find dev server
	let baseUrl = null;
	const portChecks = [];
	for (let port = 8080; port <= 8090; port++) {
		portChecks.push(checkPort(port));
	}
	const results = await Promise.all(portChecks);
	const foundPort = results.find((p) => p !== null);

	if (!foundPort) {
		console.log("ERROR: No dev server found on ports 8080-8090");
		console.log("HINT: Run 'npm run start' first");
		process.exit(1);
	}
	baseUrl = `http://localhost:${foundPort}`;

	// 2. Normalize module name
	// Detect file path input before dot→slash normalization would destroy it.
	// File paths contain "/" and end with ".qunit.js" or ".qunit.html".
	// Pattern: [abs-or-rel/]src/<library>/test/<namespace>/qunit/[subdirs/]<Name>.qunit.js
	let componentName;
	let libraryHint = null;
	let fileKeyHint = null; // relative path from qunit dir, used as testsuite key candidate

	const isFilePath = moduleInput.includes("/") &&
		(/\.qunit\.(js|html)$/.test(moduleInput) || (moduleInput.includes("/test/") && moduleInput.includes("/qunit/")));

	if (isFilePath) {
		// Strip suffix to get the base
		const stripped = moduleInput.replace(/\.qunit\.(js|html)$/, "");
		componentName = path.basename(stripped);

		// Extract library from src/<library>/test/ pattern
		const libMatch = moduleInput.match(/(?:^|\/|\\)src\/([^/\\]+)\/test\//);
		if (libMatch) {
			libraryHint = libMatch[1];

			// Extract file key: path relative to the qunit/ directory (without suffix)
			// e.g., "extensions/KeyboardDelegate" from ".../qunit/extensions/KeyboardDelegate.qunit.js"
			const qunitMarker = "/qunit/";
			const qunitIdx = stripped.indexOf(qunitMarker);
			if (qunitIdx !== -1) {
				fileKeyHint = stripped.substring(qunitIdx + qunitMarker.length);
			}
		}
	} else {
		const moduleNormalized = moduleInput.replace(/\./g, "/");
		componentName = path.basename(moduleNormalized);

		// Detect library hint from fully qualified name
		if (moduleNormalized.startsWith("sap/")) {
			const parts = moduleNormalized.split("/");
			for (let end = parts.length - 1; end >= 2; end--) {
				const candidate = parts.slice(0, end).join(".");
				if (fs.existsSync(path.join(repoRoot, "src", candidate))) {
					libraryHint = candidate;
					break;
				}
			}
		}
	}

	// 3. Find test file
	const testFileName = `${componentName}.qunit.js`;
	const allTestFiles = findFiles(path.join(repoRoot, "src"), new RegExp(`^${escapeRegex(testFileName)}$`, "i"), {
		mustBeUnderQunit: true,
		excludeDemokit: true
	});

	// When we have a library hint, filter to that library's files first
	let orderedTestFiles = [...allTestFiles];
	if (libraryHint) {
		const preferred = allTestFiles.filter((f) => f.includes(`/src/${libraryHint}/`));
		const rest = allTestFiles.filter((f) => !f.includes(`/src/${libraryHint}/`));
		orderedTestFiles = [...preferred, ...rest];
	}

	// 4-6. For each candidate test file, find matching testsuite and build URL.
	// Collect ALL matches so the user can choose when ambiguous.
	const allMatches = [];

	for (const candidateFile of orderedTestFiles) {
		const libMatch = candidateFile.match(/(?:^|\/)src\/([^/]+)\/test\//);
		const lib = libMatch ? libMatch[1] : null;
		if (!lib) continue;

		const qunitDir = toForwardSlash(path.join(repoRoot, "src", lib, "test", lib.replace(/\./g, "/"), "qunit"));
		let fileKey;
		if (fs.existsSync(qunitDir) && candidateFile.startsWith(qunitDir + "/")) {
			fileKey = candidateFile.slice(qunitDir.length + 1).replace(/\.qunit\.js$/, "");
		} else {
			fileKey = componentName;
		}

		// Build candidate keys for this file
		// Testsuite keys can use slash or dot notation (e.g., "p13n/Popup" vs "p13n.Popup"),
		// so try both for each candidate.
		// When input was a file path, fileKeyHint gives us the exact relative key from the
		// qunit directory — prepend it as the highest-priority candidate.
		const candidateKeys = [fileKey];
		if (fileKeyHint && fileKeyHint !== fileKey && !candidateKeys.includes(fileKeyHint)) {
			candidateKeys.unshift(fileKeyHint);
		}
		if (fileKey.includes("/")) {
			// Add dot-notation variant: "p13n/Popup" -> "p13n.Popup"
			candidateKeys.push(fileKey.replace(/\//g, "."));
			const parts = fileKey.split("/");
			for (let i = 1; i < parts.length; i++) {
				const suffix = parts.slice(i).join("/");
				candidateKeys.push(suffix);
				if (suffix.includes("/")) {
					candidateKeys.push(suffix.replace(/\//g, "."));
				}
			}
		}
		if (!candidateKeys.includes(componentName)) {
			candidateKeys.push(componentName);
		}

		// Search testsuites for this library
		const testDir = path.join(repoRoot, "src", lib, "test");
		const testsuiteFiles = findFiles(testDir, /^testsuite.*\.qunit\.js$/, { excludeDemokit: true });

		let found = false;
		for (const ck of candidateKeys) {
			for (const tsFile of testsuiteFiles) {
				const parsed = parseTestsuite(tsFile);
				const realKey = findKeyIgnoreCase(parsed.tests, ck);
				if (realKey) {
					allMatches.push({
						testFile: candidateFile,
						library: lib,
						foundKey: realKey,
						testsuite: tsFile,
						parsedSuite: parsed
					});
					found = true;
					break;
				}
			}
			if (found) break;
		}
	}

	// Fallback: if no matches found via file discovery, search testsuites directly
	// for the component name as a key. This handles cases like "Element" where no
	// Element.qunit.js exists but "Element" is a valid testsuite key.
	if (allMatches.length === 0) {
		// Determine which libraries to search
		const libDirs = libraryHint
			? [libraryHint]
			: fs.readdirSync(path.join(repoRoot, "src")).filter((d) => {
				const testDir = path.join(repoRoot, "src", d, "test");
				return fs.existsSync(testDir) && fs.statSync(path.join(repoRoot, "src", d)).isDirectory();
			});

		for (const lib of libDirs) {
			const testDir = path.join(repoRoot, "src", lib, "test");
			if (!fs.existsSync(testDir)) continue;
			const testsuiteFiles = findFiles(testDir, /^testsuite.*\.qunit\.js$/, { excludeDemokit: true });

			for (const tsFile of testsuiteFiles) {
				const parsed = parseTestsuite(tsFile);
				const realKey = findKeyIgnoreCase(parsed.tests, componentName);
				if (realKey) {
					allMatches.push({
						testFile: null,
						library: lib,
						foundKey: realKey,
						testsuite: tsFile,
						parsedSuite: parsed
					});
					break; // one match per library is enough
				}
			}
		}
	}

	// Fallback: if still no matches, search inside module: [...] arrays of test entries.
	// This handles cases like "Element_focus" which is listed inside the "Element" test's
	// module array but has no top-level testsuite key of its own.
	if (allMatches.length === 0) {
		const libDirs2 = libraryHint
			? [libraryHint]
			: fs.readdirSync(path.join(repoRoot, "src")).filter((d) => {
				const testDir2 = path.join(repoRoot, "src", d, "test");
				return fs.existsSync(testDir2) && fs.statSync(path.join(repoRoot, "src", d)).isDirectory();
			});

		const lowerComponent = componentName.toLowerCase();
		for (const lib of libDirs2) {
			const testDir = path.join(repoRoot, "src", lib, "test");
			if (!fs.existsSync(testDir)) continue;
			const testsuiteFiles = findFiles(testDir, /^testsuite.*\.qunit\.js$/, { excludeDemokit: true });

			for (const tsFile of testsuiteFiles) {
				const parsed = parseTestsuite(tsFile);
				for (const [parentKey, entry] of Object.entries(parsed.tests)) {
					if (!entry.modules) continue;
					const hasMatch = entry.modules.some((m) => m.toLowerCase() === lowerComponent);
					if (hasMatch) {
						allMatches.push({
							testFile: null,
							library: lib,
							foundKey: parentKey,
							testsuite: tsFile,
							parsedSuite: parsed
						});
						break;
					}
				}
				if (allMatches.length > 0) break;
			}
			if (allMatches.length > 0) break;
		}
	}

	// Filter matches when user gave a qualified name (library hint exists):
	// 1. Keep only matches from the hinted library
	// 2. Among those, if any match has foundKey === componentName exactly,
	//    pick the one whose test file path is the most direct (no subdirs)
	let finalMatches = allMatches;
	if (libraryHint && allMatches.length > 1) {
		const fromLib = allMatches.filter((m) => m.library === libraryHint);
		if (fromLib.length > 0) {
			finalMatches = fromLib;
			// Further narrow: if there are exact key matches, prefer the direct file
			const exact = fromLib.filter((m) => m.foundKey.toLowerCase() === componentName.toLowerCase());
			if (exact.length > 1) {
				const direct = exact.filter((m) => {
					if (!m.testFile) return false;
					const qDir = toForwardSlash(path.join(repoRoot, "src", m.library, "test", m.library.replace(/\./g, "/"), "qunit"));
					const relPath = m.testFile.startsWith(qDir + "/")
						? m.testFile.slice(qDir.length + 1).replace(/\.qunit\.js$/, "")
						: null;
					return relPath && relPath.toLowerCase() === componentName.toLowerCase();
				});
				if (direct.length > 0) finalMatches = direct.slice(0, 1);
			} else if (exact.length === 1) {
				finalMatches = exact;
			}
		}
	}

	// Deduplicate matches — the same lib + key can appear more than once when
	// multiple .qunit.js files in the same library match the same testsuite key.
	{
		const seen = new Set();
		finalMatches = finalMatches.filter(m => {
			const k = `${m.library}:${m.foundKey}`;
			if (seen.has(k)) return false;
			seen.add(k);
			return true;
		});
	}

	if (finalMatches.length === 0) {
		console.log(`ERROR: No test found for '${moduleInput}'`);
		console.log(`SEARCHED: testsuite keys and files matching ${componentName}.qunit.js`);
		console.log(`FINDER_URL: ${baseUrl}/test.html`);
		process.exit(1);
	}

	// 7. Construct URLs for all matches
	function buildUrl(match) {
		const { foundKey, testsuite, parsedSuite, library } = match;
		const individualPage = parsedSuite.tests[foundKey]?.page;

		// Testsuite relative path: used for {suite} placeholder and test_runner fallback
		const tsRelative = testsuite
			.replace(`${repoRoot}/src/${library}/test/`, "test-resources/")
			.replace(/\.js$/, "");

		function substitutePlaceholders(url) {
			return url.replace(/\{name\}/g, foundKey).replace(/\{suite\}/g, tsRelative);
		}

		if (individualPage) {
			return { urlType: "individual_page", testUrl: `${baseUrl}/${substitutePlaceholders(individualPage)}` };
		} else if (parsedSuite.defaultsPage && (parsedSuite.defaultsPage.includes("{name}") || parsedSuite.defaultsPage.includes("{suite}"))) {
			return { urlType: "defaults_page", testUrl: `${baseUrl}/${substitutePlaceholders(parsedSuite.defaultsPage)}` };
		} else if (parsedSuite.defaultsPage) {
			return { urlType: "defaults_page_static", testUrl: `${baseUrl}/${parsedSuite.defaultsPage}` };
		} else {
			return { urlType: "test_runner", testUrl: `${baseUrl}/resources/sap/ui/test/starter/Test.qunit.html?testsuite=${tsRelative}&test=${foundKey}` };
		}
	}

	// 8. Output
	console.log(`MODULE: ${moduleInput}`);
	console.log(`BASE_URL: ${baseUrl}`);
	console.log(`MATCHES: ${finalMatches.length}`);

	finalMatches.forEach((match, idx) => {
		const { urlType, testUrl } = buildUrl(match);
		const prefix = finalMatches.length > 1 ? `MATCH_${idx + 1}_` : "";
		console.log(`${prefix}TEST_FILE: ${match.testFile}`);
		console.log(`${prefix}LIBRARY: ${match.library}`);
		console.log(`${prefix}TEST_KEY: ${match.foundKey}`);
		console.log(`${prefix}TESTSUITE: ${match.testsuite}`);
		console.log(`${prefix}URL_TYPE: ${urlType}`);
		console.log(`${prefix}TEST_URL: ${testUrl}`);
	});
}

// Extract bare name from a module array entry path.
// "testdata/core/Element_focus.qunit" → "Element_focus"
// "./rules/Button.qunit" → "Button"
// "./UploadCollection.qunit" → "UploadCollection"
function moduleEntryToBareName(entry) {
	return path.basename(entry).replace(/\.qunit$/, "");
}

function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Case-insensitive key lookup in an object. Returns the actual key (correct case) or null.
function findKeyIgnoreCase(obj, key) {
	const lower = key.toLowerCase();
	return Object.keys(obj).find((k) => k.toLowerCase() === lower) || null;
}

main().catch((err) => {
	console.error("UNEXPECTED ERROR:", err.message);
	process.exit(1);
});
