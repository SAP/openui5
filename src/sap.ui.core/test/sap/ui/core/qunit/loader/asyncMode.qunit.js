/*global QUnit, sinon */
(function() {
	"use strict";

	var privateLoaderAPI = sap.ui.loader._;

	QUnit.config.autostart = false;

	if ( QUnit.urlParams["rtf"] || QUnit.urlParams["repeat-to-failure"]) {
		QUnit.done(function(results) {
			if (results.failed === 0) {
				setTimeout(function() {
					location.reload();
				}, 100);
			}
		});
	}
	QUnit.config.urlConfig.push({
		id: "repeat-to-failure",
		label: "Repeat",
		value: false,
		tooltip: "Whether this test should auto-repeat until it fails"
	});

	privateLoaderAPI.logger = {
		/*eslint-disable no-console */
		debug: function() {
			console.log.apply(console, arguments);
		},
		info: function() {
			console.log.apply(console, arguments);
		},
		warning: function() {
			console.warn.apply(console, arguments);
		},
		error: function() {
			console.error.apply(console, arguments);
		},
		/*eslint-enable no-console */
		isLoggable: function() { return true; }
	};
	sap.ui.loader.config({
		paths: {
			'fixture': 'fixture/'
		}
	});

	function noop() {}

	function isEmpty(obj) {
		// eslint-disable-next-line no-unreachable-loop
		for (var key in obj ) {
			return false;
		}
		return true;
	}

	function isThenable(obj) {
		return obj && typeof obj === "object" && typeof obj.then === "function";
	}

	// ========================================================================================
	// Dependency Resolution (with async APIs)
	// ========================================================================================

	QUnit.module("Dependency Resolution");

	QUnit.test("fully qualified dependency names, no cycles", function(assert) {
		var done = assert.async();
		sap.ui.require(['fixture/dependencies-without-mapping/module1'], function(module1) {
			var module2 = sap.ui.require('fixture/dependencies-without-mapping/module2');
			var module3 = sap.ui.require('fixture/dependencies-without-mapping/module3');
			assert.ok(module1, "module1 has been loaded");
			assert.ok(module2, "module2 has been loaded");
			assert.ok(module3, "module3 has been loaded");
			assert.equal(module1.name, 'module1', "module1 has expected content");
			assert.equal(module2.name, 'module2', "module2 has expected content");
			assert.equal(module3.name, 'module3', "module3 has expected content");
			assert.ok(module1.module2, "module1 got a reference to module2");
			assert.strictEqual(module1.module2, module2, "module1 got the right reference to module2");
			assert.ok(module2.module3, "module2 got a reference to module3");
			assert.strictEqual(module2.module3, module3, "module2 got the right reference to module3");
			assert.strictEqual(window['dependencies-without-mapping'].afterDefineModule1.module1, undefined);
			assert.strictEqual(window['dependencies-without-mapping'].afterDefineModule3.module3, undefined);
			assert.strictEqual(window['dependencies-without-mapping'].afterDefineModule3.module3Global, undefined);
			done();
		});
	});

	QUnit.test("Dependency names without mappings, indirect cycle", function(assert) {
		var done = assert.async();
		sap.ui.require(['fixture/cyclic-dependency-without-mapping/module1'], function(module1) {
			var module2 = sap.ui.require('fixture/cyclic-dependency-without-mapping/module2');
			var module3 = sap.ui.require('fixture/cyclic-dependency-without-mapping/module3');
			assert.ok(module1, "module1 has been loaded");
			assert.ok(module2, "module2 has been loaded");
			assert.ok(module3, "module3 has been loaded");
			assert.equal(module1.name, 'module1', "module1 has expected content");
			assert.equal(module2.name, 'module2', "module1 has expected content");
			assert.equal(module3.name, 'module3', "module1 has expected content");
			assert.ok(module1.module2, "module1 got a reference to module2");
			assert.strictEqual(module1.module2, module2, "module1 got the right reference to module2");
			assert.ok(module2.module3, "module2 got a reference to module3");
			assert.strictEqual(module2.module3, module3, "module2 got the right reference to module3");
			assert.strictEqual(module3.module1, undefined, "module3 got undefined as reference to module1 (cycle)");
			assert.strictEqual(window['cyclic-dependency-without-mapping'].afterDefineModule1.module1, undefined);
			assert.strictEqual(window['cyclic-dependency-without-mapping'].afterDefineModule3.module3, undefined);
			assert.strictEqual(window['cyclic-dependency-without-mapping'].afterDefineModule3.module3Global, undefined);
			done();
		});
	});

	QUnit.test("Dependency names with leading Slash '/'", function(assert) {
		var done = assert.async();

		var sErrorLog = "Module names that start with a slash should not be used, as they are reserved for future use.";

		var fnOriginalLog = privateLoaderAPI.logger.error;
		privateLoaderAPI.logger.error = function (sMsg) {
			assert.equal(sMsg, sErrorLog, "Correct Error logged for leading Slash");
		};

		sap.ui.require(["/sap/ui/base/Exception"], function (Icon) {
			privateLoaderAPI.logger.error = fnOriginalLog;
			done();
		});
	});



	// ========================================================================================
	// Special Dependencies require/module/exports
	// ========================================================================================

	QUnit.module("Special Dependencies", {});

	QUnit.test("require", function(assert) {
		var done = assert.async();
		sap.ui.require([
			'fixture/require-module-exports/module',
			'fixture/require-module-exports/subpackage/module'
		], function(module, subpkgMod) {
			assert.equal(typeof module.require, 'function', "special dependency require should be a function");
			assert.equal(typeof module.require.toUrl, 'function', "special dependency require should have function property toUrl");
			assert.equal(module.require.toUrl('./test.json'), sap.ui.require.toUrl('fixture/require-module-exports/test.json'), "toUrl should resolve relative URLs");
			assert.equal(module.require.toUrl('../test.json'), sap.ui.require.toUrl('fixture/test.json'), "toUrl should resolve relative URLs");
			assert.equal(typeof subpkgMod.require, 'function', "special dependency require should be a function");
			assert.equal(typeof subpkgMod.require.toUrl, 'function', "special dependency require should have function property toUrl");
			assert.equal(subpkgMod.require.toUrl('./test.json'), sap.ui.require.toUrl('fixture/require-module-exports/subpackage/test.json'), "toUrl should resolve relative URLs");
			assert.equal(subpkgMod.require.toUrl('../test.json'), sap.ui.require.toUrl('fixture/require-module-exports/test.json'), "toUrl should resolve relative URLs");
			done();
		});
	});

	QUnit.test("exports", function(assert) {
		var done = assert.async();
		sap.ui.require([
			'fixture/require-module-exports/module',
			'fixture/require-module-exports/subpackage/module'
		], function(module, subpkgMod) {
			assert.ok(isEmpty(module.exports), "special dependency exports initially should be an empty object");
			assert.strictEqual(module.exports, module.module.exports, "initially, module.exports and exports should be the same");
			assert.ok(isEmpty(subpkgMod.exports), "special dependency exports initially should be an empty object");
			assert.strictEqual(subpkgMod.exports, subpkgMod.module.exports, "initially, module.exports and exports should be the same");
			done();
		});
	});

	QUnit.test("module", function(assert) {
		var done = assert.async();
		sap.ui.require([
			'fixture/require-module-exports/module',
			'fixture/require-module-exports/subpackage/module'
		], function(module, subpkgMod) {
			assert.equal(typeof module.module, 'object', "special dependency module should be an object");
			assert.equal(module.module.id, 'fixture/require-module-exports/module', "special dependency module should have an 'id' property with the module ID");
			assert.ok(Object.hasOwn(module.module, 'exports'), "special dependency module should have an 'exports' property");
			assert.ok(isEmpty(module.module.exports), "exports initially should be an empty object");
			done();
		});
	});

	QUnit.test("Export Variants", function(assert) {
		var done = assert.async();
		sap.ui.require([
			'fixture/require-module-exports/export-as-return-value',
			'fixture/require-module-exports/export-as-members-of-exports',
			'fixture/require-module-exports/export-as-module-exports'
		], function(returnValue, membersOfExports, moduleExports) {
			assert.deepEqual(returnValue, "return-value",
					"a module that only returns a value should have that value");
			assert.deepEqual(membersOfExports, {value1:'exports.value1', value2: 'exports.value2'},
					"a module that assigns to members of exports should use the default exports object as export");
			assert.deepEqual(typeof moduleExports, 'object',
					"a module that assigns to module.exports should have the assigned value as export");
			assert.equal(typeof moduleExports['old.module.exports'], 'object',
					"[test consistency] returned info object should contain the old module.exports object");
			assert.notStrictEqual(moduleExports['old.module.exports'], moduleExports,
					"old and new value of module.exports should differ");
			assert.strictEqual(moduleExports['old.module.exports'], moduleExports['old.exports'],
					"old module.exports and old exports should be the same");
			done();
		});
	});

	QUnit.test("Priority of export variants", function(assert) {
		var done = assert.async();
		sap.ui.require([
			'fixture/require-module-exports/conflicting-return-value-and-exports',
			'fixture/require-module-exports/conflicting-falsy-return-value-and-exports',
			'fixture/require-module-exports/conflicting-undefined-return-value-and-exports',
			'fixture/require-module-exports/conflicting-module-exports-and-return-value',
			'fixture/require-module-exports/conflicting-undefined-module-exports-and-return-value',
			'fixture/require-module-exports/conflicting-module-exports-and-exports'
		], function(
				returnAndExports, falsyReturnAndExports, undefinedReturnAndExports,
				moduleExportsAndReturn, undefinedModuleExportsAndReturn, moduleExportsAndExports) {
			assert.equal(returnAndExports, "return-value",
					"a return value should be preferred over assignments to exports");
			assert.strictEqual(falsyReturnAndExports, "",
					"a falsy return value should be preferred over assignments to exports");
			assert.deepEqual(undefinedReturnAndExports, {value1:'exports.value1', value2: 'exports.value2'},
					"assignments to exports should be preferred over an undefined return value");
			assert.deepEqual(moduleExportsAndReturn, {"module-exports": true},
					"assignment to module.exports should be preferred over a return value");
			assert.equal(undefinedModuleExportsAndReturn, "return-value",
					"return value should be preferred over an assignment of undefined to module.exports");
			assert.deepEqual(moduleExportsAndExports, {"module-exports": true},
					"assignment to module.exports should be preferred over assignments to exports");
			done();
		});
	});



	// ========================================================================================
	// Error Handling for sync and async APIs
	// ========================================================================================

	QUnit.module("Error Handling", {
		beforeEach: function() {
			// Ensure to ignore global errors
			// Not using "QUnit.config.current.ignoreGlobalErrors = true;" as this
			// would still cause some test runners like Karma to report an error
			this.origOnError = window.onerror;
			window.onerror = this.stub().returns(false);
		},
		afterEach: function() {
			window.onerror = this.origOnError;
		}
	});

	[
		{
			caption: "a missing module",
			module: 'non-existing-module',
			error: /failed to load '.*\/non-existing-module.js' from .*\/non-existing-module.js/
		},
		{
			caption: "an AMD module with a missing dependency",
			module: 'amd/module-with-missing-dependency'
		},
		{
			caption: "an AMD module with a dependency to a failing AMD module",
			module: 'amd/module-with-dependency-to-failing-amd-module'
		},
		{
			caption: "an AMD module with a dependency to an already failed AMD module",
			module: 'amd/module-with-dependency-to-failed-amd-module',
			requireFirst: 'amd/failing-module1'
		}
	].forEach(function(config) {

		var ASYNC_SCENARIO = "fixture/error-handling-async-caller/";
		var sMethod = config.skip ? "skip" : "test";

		QUnit[sMethod]("When " + config.caption + " is required asynchronously...", function(assert) {
			var pTestCase = Promise.resolve();

			if ( config.requireFirst ) {
				pTestCase = new Promise(function(fnResolve, fnReject) {
					sap.ui.require([ASYNC_SCENARIO + config.requireFirst], fnResolve, fnReject);
				}).catch(noop); // ignore failures
			}

			return pTestCase.then(function() {
				return new Promise(function(resolve) {
					sap.ui.require([ASYNC_SCENARIO + config.module], function() {
						assert.ok(false, "the success callback should not be called on first access");
						resolve();
					}, function(oErr) {
						assert.ok(true, "the errback should be called on first access");
						if ( config.error ) {
							assert.ok(config.error.test(oErr.message), "error should match expected text");
						}
						resolve();
					});
				}).then(function() {
					return new Promise(function(resolve) {
						sap.ui.require([ASYNC_SCENARIO + config.module], function() {
							assert.ok(false, "the success callback should not be called on second access");
							resolve();
						}, function(oErr) {
							assert.ok(true, "the errback should be called again on second access");
							resolve();
						});
					});
				});
			});

		});
		// TODO check that no further request goes out the second time?
	});

	// ========================================================================================
	// Mapping of Module IDs
	// ========================================================================================

	QUnit.module("ID Mapping");

	QUnit.test("map ID prefix for any context", function(assert) {
		var done = assert.async();
		sap.ui.loader.config({
			map: {
				'*': {
					'dependencies-generally-prefix-mapped-alias': 'fixture/dependencies-generally-prefix-mapped'
				}
			}
		});

		sap.ui.require([
			'dependencies-generally-prefix-mapped-alias/module1',
			'fixture/dependencies-generally-prefix-mapped/module1',
			'fixture/dependencies-generally-prefix-mapped/module2'
		], function(module1a, module1b, module2) {
			assert.ok(module1a, "module1 has been loaded via alias (a)");
			assert.ok(module1b, "module1 has been loaded without alias (b)");
			assert.equal(module1a.name, 'module1', "module1 has expected content");
			assert.equal(module1b.name, 'module1', "module1 has expected content");
			assert.strictEqual(typeof module1b.info, 'object', "module1 got a module info");
			assert.strictEqual(module1b.info.id, 'fixture/dependencies-generally-prefix-mapped/module1', "module info for module1 has the full name (unmapped)");
			assert.strictEqual(module1a, module1b, "both module references should be the same");
			assert.strictEqual(module1a, module2.module1Alias, "module2 should have got a reference to module1 via alias'");
			assert.strictEqual(module1a, module2.module1FullName, "module2 should have got a reference to module1 via full name'");
			assert.strictEqual(module1a, module2.module1RelativeName, "module2 should have got a reference to module1 via relative name'");
			done();
		});
	});

	QUnit.test("map full ID for any context", function(assert) {
		var done = assert.async();
		sap.ui.loader.config({
			map: {
				'*': {
					'fixture/dependencies-generally-full-id-mapped/module-alias1': 'fixture/dependencies-generally-full-id-mapped/module1'
				}
			}
		});

		sap.ui.require(['fixture/dependencies-generally-full-id-mapped/module-alias1', 'fixture/dependencies-generally-full-id-mapped/module1', 'fixture/dependencies-generally-full-id-mapped/module2'], function(module1a, module1b, module2) {
			assert.ok(module1a, "module1 has been loaded via alias (a)");
			assert.ok(module1b, "module1 has been loaded without alias (b)");
			assert.equal(module1a.name, 'module1', "module1 has expected content");
			assert.equal(module1b.name, 'module1', "module1 has expected content");
			assert.strictEqual(typeof module1b.info, 'object', "module1 got a module info");
			assert.strictEqual(module1b.info.id, 'fixture/dependencies-generally-full-id-mapped/module1', "module info for module1 has the full name (unmapped)");
			assert.strictEqual(module1a, module1b, "both module references should be the same");
			assert.strictEqual(module1a, module2.module1Alias, "module2 should have got a reference to module1 via alias'");
			assert.strictEqual(module1a, module2.module1FullName, "module2 should have got a reference to module1 via full name'");
			assert.strictEqual(module1a, module2.module1RelativeName, "module2 should have got a reference to module1 via relative name'");
			done();
		});
	});

	QUnit.test("map full ID with UI5 subtypes for any context", function(assert) {
		var done = assert.async();
		sap.ui.loader.config({
			map: {
				'*': {
					'fixture/general-mapping-with-subtypes/module-alias1': 'fixture/general-mapping-with-subtypes/module1',
					'fixture/general-mapping-with-subtypes/module-alias2.controller': 'fixture/general-mapping-with-subtypes/module2.controller',
					'fixture/general-mapping-with-subtypes/module-alias2.view': 'fixture/general-mapping-with-subtypes/module2.view'
				}
			}
		});

		sap.ui.require([
			'fixture/general-mapping-with-subtypes/module-alias1',
			'fixture/general-mapping-with-subtypes/module-alias1.controller',
			'fixture/general-mapping-with-subtypes/module-alias1.view',
			'fixture/general-mapping-with-subtypes/module-alias2',
			'fixture/general-mapping-with-subtypes/module-alias2.controller',
			'fixture/general-mapping-with-subtypes/module-alias2.view'
		], function(module1, module1Controller, module1View, module2, module2Controller, module2View) {
			assert.strictEqual(module1.name, 'module1', "for module-alias1, the main module should be mapped to module1");
			assert.strictEqual(module1Controller.name, 'module-alias1.controller', "for module-alias1, the module with subtype 'controller' should not be mapped");
			assert.strictEqual(module1View.name, 'module-alias1.view', "for module-alias1, the module with subtype 'view' should not be mapped");
			assert.strictEqual(module2.name, 'module-alias2', "for module-alias2, the main module should not be mapped");
			assert.strictEqual(module2Controller.name, 'module2.controller', "for module-alias2, the module with subtype 'controller' should be mapped to module2.controller");
			assert.strictEqual(module2View.name, 'module2.view', "for module-alias2, the module with subtype 'view' should be mapped to module2.view");
			done();
		});
	});

	QUnit.test("map ID to different targets, depending on context", function(assert) {
		var done = assert.async();
		sap.ui.loader.config({
			map: {
				'*': {
					'fixture/dependencies-with-contextual-mapping/module3': 'fixture/dependencies-with-contextual-mapping/module3-v3'
				},
				'fixture/dependencies-with-contextual-mapping': {
					'fixture/dependencies-with-contextual-mapping/module3': 'fixture/dependencies-with-contextual-mapping/module3-v1'
				},
				'fixture/dependencies-with-contextual-mapping/module2': {
					'fixture/dependencies-with-contextual-mapping/module3': 'fixture/dependencies-with-contextual-mapping/module3-v2'
				}
			}
		});

		sap.ui.require([
			'fixture/dependencies-with-contextual-mapping/module1',
			'fixture/dependencies-with-contextual-mapping/module2',
			'fixture/dependencies-with-contextual-mapping/module3'
		], function(module1, module2, module3) {
			assert.strictEqual(module1.module3.name, 'module3-v1', "for module1, module3 should have been mapped to v1 (via mapping for parent package)");
			assert.strictEqual(module2.module3.name, 'module3-v2', "for module2, module3 should have been mapped to v2 (via a concrete mapping for module2's ID");
			assert.strictEqual(module3.name, 'module3-v3', "a direct reference to module3 should hav been mapped to module3 via the default mapping ('*')");
			done();
		});
	});

	QUnit.test("cycle detection in case of module-ID mapping", function(assert) {
		var done = assert.async();
		sap.ui.loader.config({
			map: {
				'*': {
					'cyclic-dependency-with-mapping-alias': 'fixture/cyclic-dependency-with-mapping'
				}
			}
		});
		sap.ui.require(['fixture/cyclic-dependency-with-mapping/module1'], function(module1) {
			var module2 = sap.ui.require('fixture/cyclic-dependency-with-mapping/module2');
			assert.ok(module1, "module1 has been loaded");
			assert.ok(module2, "module2 has been loaded");
			done();
		});
	});



	// ========================================================================================
	// Embedded Defines
	// ========================================================================================

	QUnit.module("Embedded Module Definitions");

	QUnit.test("No Outgoing Request", function(assert) {
		var done = assert.async();
		var fnAppendChildSpy = this.spy(document.head, "appendChild");
		var UNIQUE = {};

		assert.expect(2);

		// Act:
		// embedded module definition
		sap.ui.define("fixture/embedded-module-definitions/module1", [], function() {
			return UNIQUE;
		});
		// request it in the same browser task
		sap.ui.require(["fixture/embedded-module-definitions/module1"], function(module1) {
			assert.strictEqual(module1, UNIQUE, "module should have the expected export");
			assert.ok(
					fnAppendChildSpy.neverCalledWithMatch(sinon.match(function(oScript) {
					return oScript && oScript.getAttribute("data-sap-ui-module") === "fixture/embedded-module-definitions/module1.js";
				})), "no script tag should have been created for the embedded module");
			done();
		}, done);

	});

	QUnit.test("No premature READY state", function(assert) {
		var done = assert.async();
		const MODULE_NAME = "fixture/embedded-module-definitions/module2";
		const UNIQUE_FROM_PREDEFINE = {};
		const UNIQUE = {};

		// precondition: the module is already in the preload cache (state === -1)
		sap.ui.predefine(MODULE_NAME, [], function() {
			return UNIQUE_FROM_PREDEFINE;
		});

		// Act:
		// embedded module definition
		sap.ui.define(MODULE_NAME, [
			// some dependency that is not part of the preloads and which hasn't been required yet
			"sap/ui/thirdparty/jszip"
		], function() {
			return UNIQUE;
		});

		setTimeout(() => {
			assert.strictEqual(
				sap.ui.require(MODULE_NAME),
				undefined,
				"module is not defined yet"
			);
			assert.notStrictEqual(
				privateLoaderAPI.getModuleState(MODULE_NAME + ".js"),
				/* READY */ 4,
				"module should not be READY immediately after sap.ui.define call was processed"
			);

			sap.ui.require([MODULE_NAME], function(importValue) {
				assert.strictEqual(
					importValue,
					UNIQUE,
					"require should receive the module export from the embedded module"
				);
				done();
			}, function() {
				assert.ok(false, "no error should occur when requiring the module");
				done();
			});
		}, 0); // depends on implementation details: must be after ui5loader's queue processing timeout of 0
	});



	// ========================================================================================
	// Inconsistent Module IDs
	// ========================================================================================

	QUnit.module("Inconsistent Module IDs");

	/*
	 * Case where a module uses a named sap.ui.define call with ID 'A', but is required with ID 'B'.
	 * After requiring and executing the module, both IDs should be known and have the same export.
	 */
	QUnit.test("single module", function(assert) {
		var done = assert.async();
		var expected = {
			id:"fluffy-unicorn"
		};
		sap.ui.require(["fixture/inconsistent-naming/inconsistently-named-module"], function(mod) {
			assert.deepEqual(mod, expected, "the right module should have been loaded");
			assert.strictEqual(sap.ui.require(expected.id), mod, "the alternative name should give the exact same export");
			done();
		}, function(err) {
			assert.strictEqual(err, null, "errback should not be called");
			done();
		});
	});

	/*
	 * Case where a module uses a named sap.ui.define call with ID 'A', but is required with ID 'B'.
	 * Additionally, it declares a dependency to itself, using ID 'B' (cycle with alias).
	 *
	 * The cycle should be detected and be broken up and after requiring and executing the module,
	 * both IDs should be known and have the same export.
	 */
	QUnit.test("single module with cycle to self", function(assert) {
		var done = assert.async();
		var expected = {
			id:"fluffy-self-regarding-unicorn",
			alt: undefined
		};
		sap.ui.require(["fixture/inconsistent-naming/inconsistently-named-self-regarding-module"], function(mod) {
			assert.deepEqual(mod, expected, "the right module should have been loaded");
			assert.strictEqual(sap.ui.require(expected.id), mod, "the alternative name should give the exact same export");
			done();
		}, function() {
			assert.notOk(true, "errback should not be called");
			done();
		});
	});

	/*
	 * Case where a module uses a named sap.ui.define call with ID 'A', but is required with ID 'B'.
	 * Additionally, the module is part of a longer cyclic dependency which refers to the module using 'B'.
	 *
	 * The cycle should be detected and be broken up and after requiring and executing the modules,
	 * the expected export should be returned.
	 */
	QUnit.test("cycle of length 3", function(assert) {
		var done = assert.async();
		sap.ui.require(["fixture/inconsistent-naming/cycle-member1"], function(mod) {
			assert.ok(true, "the cycle should have been detected and the modules should have been loaded");
			assert.deepEqual(sap.ui.require("fixture/inconsistent-naming/cycle-member1"), {id:"fixture/inconsistent-naming/cycle-member1"}, "the first member of the circle");
			assert.deepEqual(sap.ui.require("fixture/inconsistent-naming/cycle-member2-inconsistently-named"), {id:"beautiful-butterfly"}, "the 2nd member of the circle");
			assert.deepEqual(sap.ui.require("fixture/inconsistent-naming/cycle-member3"), {id:"fixture/inconsistent-naming/cycle-member3"}, "the 3rd member of the circle");
			assert.deepEqual(sap.ui.require("beautiful-butterfly"), {id:"beautiful-butterfly"}, "the alias of the 2nd member of the circle");
			done();
		}, function() {
			assert.notOk(true, "errback should not be called");
			done();
		});
	});



	// ========================================================================================
	// Multiple Module Definitions in one File
	// ========================================================================================

	QUnit.module("Multiple Modules per File (No Conflict)");

	QUnit.test("One named, one unnamed module", function(assert) {
		var done = assert.async();
		sap.ui.require(["fixture/multiple-modules-per-file/one-named-one-unnamed-define"], function(mod) {
			var expected1 = {
				id: "fixture/multiple-modules-per-file/named-module-01"
			};
			var expected2 = {
				id: "fixture/multiple-modules-per-file/one-named-one-unnamed-define"
			};
			assert.deepEqual(mod, expected2, "the required module should have the expected export");
			assert.ok(privateLoaderAPI.getModuleState(expected1.id + ".js") > 0, "second module should be known to the loader");
			done();
		}, function() {
			assert.notOk(true, "errback should not be called");
			done();
		});
	});

	QUnit.test("Two named, but unexpected modules", function(assert) {
		var done = assert.async();
		sap.ui.require(["fixture/multiple-modules-per-file/two-named-but-unexpected-defines"], function(mod) {
			var expected1 = {
				id: "fixture/multiple-modules-per-file/named-module-02"
			};
			var expected2 = {
				id: "fixture/multiple-modules-per-file/named-module-03"
			};
			assert.deepEqual(mod, expected1, "the required module should have the same export as the first named module (alias)");
			assert.ok(privateLoaderAPI.getModuleState(expected1.id + ".js") > 0, "first named module should be known to the loader");
			assert.ok(privateLoaderAPI.getModuleState(expected2.id + ".js") > 0, "second named module should be known to the loader");
			done();
		}, function() {
			assert.notOk(true, "errback should not be called");
			done();
		});
	});

	QUnit.test("Two named modules", function(assert) {
		var done = assert.async();
		sap.ui.require(["fixture/multiple-modules-per-file/two-named-defines"], function(mod) {
			var expected1 = {
				id: "fixture/multiple-modules-per-file/named-module-04"
			};
			var expected2 = {
				id: "fixture/multiple-modules-per-file/two-named-defines"
			};
			assert.deepEqual(mod, expected2, "the required module should have the expected export");
			assert.ok(privateLoaderAPI.getModuleState(expected1.id + ".js") > 0, "second module should be known to the loader");
			done();
		}, function() {
			assert.notOk(true, "errback should not be called");
			done();
		});
	});



	// ========================================================================================
	// Multiple Module Definitions in one File
	// ========================================================================================

	QUnit.module("Multiple Modules per File (Conflict)");

	// has to be skipped in non-strictModuleDefinitions mode as the call then succeeds due to the compatibility tweak for anonymous modules
	QUnit.test("Two unnamed modules", function(assert) {
		var done = assert.async();
		sap.ui.require(["fixture/multiple-modules-per-file/two-unnamed-defines"], function(mod) {
			assert.ok(false, "request unexpectedly succeeded");
			done();
		}, function(err) {
			assert.ok(true, "having two unnamed module definitions in one file should fail in strictModuleDefinitions mode");
			done();
		});
	});

	QUnit.test("Conflicting unnamed and named modules", function(assert) {
		var done = assert.async();
		sap.ui.require(["fixture/multiple-modules-per-file/conflicting-unnamed-and-named-define"], function(mod) {
			var expected = {
				id: "fixture/multiple-modules-per-file/conflicting-unnamed-and-named-define#unnamed"
			};
			assert.ok(true, "request should succeed");
			assert.deepEqual(mod, expected, "import should match the export of the first module (unnamed)");
			done();
		}, function() {
			assert.ok(false, "request should not fail");
			done();
		});
	});

	QUnit.test("Conflicting named and unnamed modules", function(assert) {
		// Expectation:
		// - when the named module is processed first, a later unnamed module should be reported as error

		var done = assert.async();
		sap.ui.require(["fixture/multiple-modules-per-file/conflicting-named-and-unnamed-define"], function(mod) {
			assert.ok(false, "request should not succeed");
			done();
		}, function(oErr) {
			assert.ok(true, "request should fail");
			assert.ok(/anonymous/.test(oErr.message) && /require.*call/.test(oErr.message),
				"the expected error should be reported");
			done();
		});
	});

	QUnit.test("Conflicting named modules", function(assert) {
		var done = assert.async();
		sap.ui.require(["fixture/multiple-modules-per-file/conflicting-named-defines"], function(mod) {
			var expected = {
				id: "fixture/multiple-modules-per-file/conflicting-named-defines#named-1"
			};
			assert.ok(true, "request should succeed");
			assert.deepEqual(mod, expected, "import should match the export of the first module (unnamed)");
			done();
		}, function() {
			assert.ok(false, "request should not fail");
			done();
		});
	});



	// ========================================================================================
	// Exports of Type "Promise"
	// ========================================================================================

	QUnit.module("Promise exports");

	QUnit.test("sap.ui.define", function(assert) {
		var doneWithDefine01 = assert.async();
		sap.ui.define("fixture/exporting-promises/test-module-01", [
			"fixture/exporting-promises/module-with-promise-export",
			"require"
		], function(_export, localRequire01) {
			assert.ok(isThenable(_export), "The export must be a thenable");

			var doneWithLocalRequire01 = assert.async();
			localRequire01(["./module-with-promise-export"], function() {
				assert.ok(isThenable(_export), "The export must be a thenable also on follow-up access with a local require");
				doneWithLocalRequire01();
			});

			var doneWithDefine02 = assert.async();
			sap.ui.define("fixture/exporting-promises/test-module-02", [
				"fixture/exporting-promises/module-with-promise-export",
				"require"
			], function(_export, localRequire02) {

				var doneWithLocalRequire02 = assert.async();
				localRequire02(["./module-with-promise-export"], function() {
					assert.ok(isThenable(_export), "The export must be a thenable also on follow-up access via a local require");
					doneWithLocalRequire02();
				});

				assert.ok(isThenable(_export), "The export must be a thenable also on 2nd access");
				doneWithDefine02();
			});

			// ensure evaluation of the 2nd module defined above
			sap.ui.require(["fixture/exporting-promises/test-module-02"], noop);
			doneWithDefine01();
		});

		// ensure evaluation of the 1st module defined above
		sap.ui.require(["fixture/exporting-promises/test-module-01"], noop);
	});

	QUnit.test("sap.ui.require", function(assert) {
		var done = assert.async();
		sap.ui.require(["fixture/exporting-promises/module-with-promise-export"], function(_export) {
			assert.ok(isThenable(_export), "The export must be a thenable");

			sap.ui.require(["fixture/exporting-promises/module-with-promise-export"], function(_export) {
				assert.ok(isThenable(_export), "The export must be a thenable also on 2nd access");
				done();
			});
		});
	});

	// ========================================================================================
	// "Real World" scenarios
	// ========================================================================================

	QUnit.module("'Real World' scenarios");

	/*
	 * Case where a named module definition is not top-level but nested in some other module,
	 * e.g. in a factory method. The module definition might be executed multiple times
	 * by the application.
	 *
	 * While standard AMD loaders ignore all but the first execution, ui5loader executes
	 * each of them but should warn about the unsupported usage.
	 */
	QUnit.skip("Repeated Module Definition (named)", function(assert) {

		var logger = privateLoaderAPI.logger;
		this.stub(logger, "error");

		var done = assert.async();

		var incarnation = 0;
		function defineModule(incarnation) {
			sap.ui.define("fixture/repeated-named-defines/module01", function() {
				return {
					id: "incarnation-" + incarnation
				};
			});
			return {
				id: "incarnation-" + incarnation
			};
		}

		var expected1 = defineModule(++incarnation);
		assert.equal(sap.ui.require("fixture/repeated-named-defines/module01"), null,
			"synchronously after the module definition, the export must not be visible");

		setTimeout(function() {
			sap.ui.require(["fixture/repeated-named-defines/module01"], function(mod1) {
				assert.deepEqual(mod1, expected1, "require should find the expected incarnation of the module");

				var expected2 = defineModule(++incarnation);
				assert.deepEqual(sap.ui.require("fixture/repeated-named-defines/module01"), expected1,
					"synchronously after the module definition, the export must not be visible");

				setTimeout(function() {
					sap.ui.require(["fixture/repeated-named-defines/module01"], function(mod2) {
						assert.deepEqual(mod2, expected2, "require should find the expected incarnation of the module");

						assert.ok(
							logger.error.calledWith(
								sinon.match(/executed more than once/i).and(sinon.match(/will fail in future/i))
							),
							"an error with the expected text fragments should have been logged");
						done();
					});
				}, 50);
			});
		}, 50);

	});

	/*
	 * Case where an unnamed module definition is not top-level but nested in some other module,
	 * e.g. in a factory method. The module definition might be executed multiple times
	 * by the application.
	 *
	 * While standard AMD loaders complain about each execution, ui5loader executes
	 * all of them but should warn about the unsupported usage.
	 */
	QUnit.skip("Repeated Module Definition (unnamed)", function(assert) {

		var logger = privateLoaderAPI.logger;
		this.stub(logger, "error");

		var done = assert.async();
		var myGlobalExport;

		var incarnation = 0;
		function defineModule(incarnation) {
			sap.ui.define(function() {
				myGlobalExport = {
					id: "incarnation-" + incarnation
				};
			});
			return {
				id: "incarnation-" + incarnation
			};
		}

		var expected1 = defineModule(++incarnation);
		assert.equal(myGlobalExport, null, "synchronously after the module definition there must be no export visible");
		// there's no official way to wait for the module definition to be executed as it has no well defined name
		// instead, we wait a while and check the global export then
		setTimeout(function() {
			assert.deepEqual(myGlobalExport, expected1, "after some time, the global variable should match the module's export");

			var expected2 = defineModule(++incarnation);
			assert.deepEqual(myGlobalExport, expected1, "synchronously after the 2nd module definition still the old value must be visible");
			setTimeout(function() {
				assert.deepEqual(myGlobalExport, expected2, "after some time, the global variable should match the module's export");
				done();
			}, 50);
		}, 50);

	});


	// ========================================================================================
	// A Complex Scenario
	// ========================================================================================

	QUnit.module("Complex Scenario");

	QUnit.test("Test jQuery shim", function(assert) {
		var done = assert.async();

		// Act
		sap.ui.require(['sap/ui/thirdparty/jquery'], function(jQ1) {

			// the duplicate registration of jQuery should have worked
			var jQ2 = sap.ui.require('jquery');
			assert.ok(jQ1, "...thirdparty/jquery has been loaded");
			assert.ok(jQ2, "jquery should have registered itself as 'jquery'");
			assert.strictEqual(jQ1, jQ2, "both fixture should have the same export");

			done();
		});
	});



	//****************************************************
	// loadJSResourceAsync
	//****************************************************

	QUnit.module("loadJSResourceAsync", {
		beforeEach: function() {
			this.scriptsWith = function(rPattern) {
				var count = 0;
				document.querySelectorAll("head>script").forEach(function(script) {
					if ( script.src && rPattern.test(script.src) ) {
						count++;
					}
				});
				return count;
			};
			var oHead = document.getElementsByTagName("head")[0];
			var _fnOriginalAppendChild = oHead.appendChild;

			this.callsFakeAppendChild = function(){};
			this.oAppendChildStub = this.stub(oHead, "appendChild").callsFake(function(oElement) {
				this.callsFakeAppendChild(oElement);
				_fnOriginalAppendChild.apply(oHead, arguments);
			}.bind(this));
		}
	});

	QUnit.test("successful call", function(assert) {
		var that = this;
		var p = privateLoaderAPI.loadJSResourceAsync("fixture/forced-async-loading/bundle1.js");
		return p.then(function() {
			assert.ok(true, "promise should succeed");
			assert.equal(this.oAppendChildStub.callCount, 1 , "should have been called once");
			assert.ok(privateLoaderAPI.getModuleState('fixture/forced-async-loading/bundle1.js'), "resource should have been loaded");
			assert.equal(that.scriptsWith(/fixture\/forced-async-loading\/bundle1\.js$/), 1, "script tag for lib should exist");
		}.bind(this), function() {
			assert.ok(false, "promise should not fail");
		});

	});

	QUnit.test("failing call", function(assert) {
		var that = this;
		var p = privateLoaderAPI.loadJSResourceAsync("fixture/forced-async-loading/non-existing.js");
		return p.then(function() {
			assert.ok(false, "promise must not succeed");
			assert.equal(this.oAppendChildStub.callCount, 2 , "should have been called twice");
		}.bind(this), function() {
			assert.ok(true, "promise should fail");
			assert.equal(that.scriptsWith(/fixture\/forced-async-loading\/non-existing\.js$/), 1, "script tag should exist");
		});

	});

	QUnit.test("failing call (ignore errors)", function(assert) {
		var that = this;
		var p = privateLoaderAPI.loadJSResourceAsync("fixture/forced-async-loading/non-existing-ignored.js", true);
		return p.then(function() {
			assert.ok(true, "promise should succeed");
			assert.equal(this.oAppendChildStub.callCount, 2 , "should have been called twice");
			assert.equal(that.scriptsWith(/fixture\/forced-async-loading\/non-existing-ignored\.js$/), 1, "script tag should exist");
		}.bind(this), function() {
			assert.ok(false, "promise must not fail");
		});

	});

	QUnit.test("first call fails, second call passes", function(assert) {
		var that = this;

		//when the desired script tag is added to the head,
		// set the src attribute to an invalid value to trigger an error event
		// let the second call pass
		//in order to simulate an SSO scenario in which the first call to a script fails, but the second succeeds
		var bFirstFailure = true;
		this.callsFakeAppendChild = function(oElement) {
			if (oElement instanceof HTMLScriptElement) {
				if (oElement.src.indexOf("forced-async-loading/bundle-first-failing.js") > -1) {
					if (bFirstFailure) {
						bFirstFailure = false;

						//set the src to a non existing file such that an error event is fired to simulate a failing request
						oElement.src = "non-existing-file";

						//check the module state
						var bIsResourceLoaded = !!privateLoaderAPI.getModuleState("fixture/forced-async-loading/bundle-first-failing.js");
						assert.ok(bIsResourceLoaded, "Module should be in loading state");
					}
				}
			}
		};

		var p = privateLoaderAPI.loadJSResourceAsync("fixture/forced-async-loading/bundle-first-failing.js");
		return p.then(function() {
			assert.ok(true, "promise should succeed");
			assert.equal(this.oAppendChildStub.callCount, 2 , "should have been called twice");
			assert.notOk(bFirstFailure, "there should be one failed try to load the module");
			assert.ok(privateLoaderAPI.getModuleState('fixture/forced-async-loading/bundle-first-failing.js'), "resource should have been loaded");
			assert.equal(that.scriptsWith(/fixture\/forced-async-loading\/bundle-first-failing\.js$/), 1, "script tag for bundle should exist");
		}.bind(this), function() {
			assert.ok(false, "promise must not fail");
		});

	});

	QUnit.test("multiple calls (succeeding)", function(assert) {
		var that = this;
		var p1 = privateLoaderAPI.loadJSResourceAsync("fixture/forced-async-loading/bundle2.js");
		var p2 = privateLoaderAPI.loadJSResourceAsync("fixture/forced-async-loading/bundle2.js");
		p1 = p1.then(function() {
			assert.ok(true, "promise should succeed");
			assert.ok(privateLoaderAPI.getModuleState('fixture/forced-async-loading/bundle2.js'), "resource should have been loaded");
		}, function() {
			assert.ok(false, "promise should not fail");
		});
		p2 = p2.then(function() {
			assert.ok(true, "promise should succeed");
			assert.ok(privateLoaderAPI.getModuleState('fixture/forced-async-loading/bundle2.js'), "resource should have been loaded");
		}, function() {
			assert.ok(false, "promise should not fail");
		});
		return Promise.all([p1,p2]).then(function() {
			assert.equal(that.scriptsWith(/fixture\/forced-async-loading\/bundle2\.js$/), 1, "only one script tag for lib should exist");
			assert.equal(this.oAppendChildStub.callCount, 1 , "should have been called twice");
		}.bind(this));
	});

	QUnit.test("multiple calls (failing)", function(assert) {
		var that = this;
		var p1 = privateLoaderAPI.loadJSResourceAsync("fixture/forced-async-loading/non-existing-multiple.js");
		var p2 = privateLoaderAPI.loadJSResourceAsync("fixture/forced-async-loading/non-existing-multiple.js", true);
		p1 = p1.then(function() {
			assert.ok(false, "promise must not succeed");
		}, function() {
			assert.ok(true, "promise should fail");
		});
		p2 = p2.then(function() {
			assert.ok(true, "promise should succeed"); // ignore errors!
		}, function() {
			assert.ok(false, "promise must not fail");
		});
		return Promise.all([p1,p2]).then(function() {
			assert.equal(that.scriptsWith(/fixture\/forced-async-loading\/non-existing-multiple\.js$/), 1, "only one script tag for lib should exist");
			assert.equal(this.oAppendChildStub.callCount, 2 , "should have been called twice");
		}.bind(this));
	});

}());