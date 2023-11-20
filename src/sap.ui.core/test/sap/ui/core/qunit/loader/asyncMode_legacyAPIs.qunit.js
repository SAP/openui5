/*global QUnit, sinon */
(function() {
	"use strict";
	QUnit.config.reorder = false; // ## remove
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

	sap.ui.loader._.logger = {
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

	function isThenable(obj) {
		return obj && typeof obj === "object" && typeof obj.then === "function";
	}

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

			return new Promise(function(resolve, reject) {
				sap.ui.require(['jquery.sap.global'], resolve, reject);
			});
		},
		afterEach: function() {
			window.onerror = this.origOnError;
		}
	});

	// skip all async tests in FF that require handling of global errors because document.currentScript is not supported during the window.error event
	var SKIP_ASYNC_ERROR_HANDLING = sap.ui.Device.browser.firefox ? "execution errors for asynchronously executed legacy modules can't be associated with the executing module" : false;

	[
		{ // sync
			caption: "a missing module",
			module: 'non-existing-module',
			error: /failed to load '.*\/non-existing-module.js' from .*\/non-existing-module.js/
		},
		{ // sync
			caption: "an AMD module with a missing dependency",
			module: 'amd/module-with-missing-dependency'
		},
		{ // sync & async
			caption: "a UI5 legacy module with a missing dependency",
			module: 'ui5-legacy/module-with-missing-dependency',
			testAsync: true,
			skip: SKIP_ASYNC_ERROR_HANDLING
		},
		{ // sync
			caption: "an AMD module with a dependency to a failing AMD module",
			module: 'amd/module-with-dependency-to-failing-amd-module'
		},
		{ // sync & async
			caption: "an AMD module with a dependency to a failing UI5 legacy module",
			module: 'amd/module-with-dependency-to-failing-ui5-legacy-module',
			testAsync: true,
			skip: SKIP_ASYNC_ERROR_HANDLING
		},
		{ // sync & async
			caption: "a UI5 legacy module with a dependency to a failing AMD module",
			module: 'ui5-legacy/module-with-dependency-to-failing-amd-module',
			testAsync: true,
			skip: SKIP_ASYNC_ERROR_HANDLING
		},
		{ // sync & async
			caption: "a UI5 legacy module with a dependency to a failing UI5 legacy module",
			module: 'ui5-legacy/module-with-dependency-to-failing-ui5-legacy-module',
			testAsync: true,
			skip: SKIP_ASYNC_ERROR_HANDLING
		},
		{	// sync
			caption: "an AMD module with a dependency to an already failed AMD module",
			module: 'amd/module-with-dependency-to-failed-amd-module',
			requireFirst: 'amd/failing-module1'
		},
		{	// sync & async
			caption: "an AMD module with a dependency to an already failed UI5 legacy module",
			module: 'amd/module-with-dependency-to-failed-ui5-legacy-module',
			requireFirst: 'ui5-legacy/failing-module1',
			testAsync: true,
			skip: SKIP_ASYNC_ERROR_HANDLING
		},
		{	// sync & async
			caption: "a UI5 legacy module with a dependency to an already failed AMD module",
			module: 'ui5-legacy/module-with-dependency-to-failed-amd-module',
			requireFirst: 'amd/failing-module2',
			testAsync: true,
			skip: SKIP_ASYNC_ERROR_HANDLING
		},
		{	// sync & async
			caption: "a UI5 legacy module with a dependency to an already failed UI5 legacy module",
			module: 'ui5-legacy/module-with-dependency-to-failed-ui5-legacy-module',
			requireFirst: 'ui5-legacy/failing-module2',
			testAsync: true,
			skip: SKIP_ASYNC_ERROR_HANDLING
		}
	].forEach(function(config) {

		// always test sync scenario (fully async test scenarios are covered by asyncMode.qunit.js)
		var SYNC_SCENARIO = "fixture/error-handling-sync-caller/";

		QUnit.test("When " + config.caption + " is required synchronously...", function(assert) {
			if ( config.requireFirst ) {
				try {
					sap.ui.requireSync(SYNC_SCENARIO + config.requireFirst);
				} catch (error) {
					// ignore
				}
			}
			assert.throws(function() {
				sap.ui.requireSync(SYNC_SCENARIO + config.module);
			}, Error, "an error should be thrown on first access");
			assert.throws(function() {
				sap.ui.requireSync(SYNC_SCENARIO + config.module);
			}, Error, "an error should be thrown when the same module is required again");
		});

		// sync<>async mixed scenarios
		// QUnit.skip'ed if on Firefox
		if (config.testAsync) {
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
		}
		// TODO check that no further request goes out the second time?
	});

	// ========================================================================================
	// Async / Sync Conflict
	// ========================================================================================

	QUnit.module("Async/Sync Conflict", {
		beforeEach: function() {
			this.logger = sap.ui.loader._.logger;
			this.spy(this.logger, "warning");
			this.spy(sap.ui.require, "load");
			window.fixture = window.fixture || {};
			window.fixture["async-sync-conflict_legacyAPIs"] = {
				executions: 0,
				EXPECTED_EXPORT: {}
			};
		},
		afterEach: function() {
			this.logger.warning.restore();
			sap.ui.require.load.restore();
			delete window.fixture["async-sync-conflict_legacyAPIs"];
		}
	});

	QUnit.test("Warning Message", function(assert) {
		var done = assert.async();

		// to get a loader-independent notification for the end of the async script loading,
		// we intercept head.appendChild calls and listen to the load/error events of the script in question
		var scriptCompleted = new Promise(function(resolve, reject) {
			var _fnOriginalAppendChild = document.head.appendChild;
			this.stub(document.head, "appendChild").callsFake(function(oElement) {
				// when the script tag for the module is appended, register for its load/error events
				if ( oElement.getAttribute("data-sap-ui-module") === "fixture/async-sync-conflict_legacyAPIs/simple.js" ) {
					oElement.addEventListener("load", resolve);
					oElement.addEventListener("error", reject);
				}
				return _fnOriginalAppendChild.call(this, oElement);
			});
			// add a timeout of 20 sec.
			setTimeout(function() {
				reject(new Error("script for module was not added within 20 seconds"));
			}, 20000);
		}.bind(this));

		// Act:
		// first require async
		sap.ui.require(["fixture/async-sync-conflict_legacyAPIs/simple"], function() {
			done();
		});
		// then sync -> should trigger a second request for the same resource
		sap.ui.requireSync("fixture/async-sync-conflict_legacyAPIs/simple");

		// Assert:
		assert.ok(
			this.logger.warning.calledWith(
				sinon.match(/sync request/i).and(sinon.match(/while async request was already pending/i))
			),
			"a warning with the expected text fragments should have been logged");

		return scriptCompleted.finally(function() {
			document.head.appendChild.restore();
		});
	});

	// this test only exists to prove that the module is executed twice in case of an async/sync conflict
	QUnit.skip("Double Execution", function(assert) {
		var done = assert.async();

		// to get a loader-independent notification for the end of the async script loading,
		// we intercept head.appendChild calls and listen to the load/error events of the script in question
		var scriptCompleted = new Promise(function(resolve, reject) {
			var _fnOriginalAppendChild = document.head.appendChild;
			this.stub(document.head, "appendChild").callsFake(function(oElement) {
				// when the script tag for the module is appended, register for its load/error events
				if ( oElement.getAttribute("data-sap-ui-module") === "fixture/async-sync-conflict_legacyAPIs/unique-executions.js" ) {
					oElement.addEventListener("load", resolve);
					oElement.addEventListener("error", reject);
				}
				return _fnOriginalAppendChild.call(this, oElement);
			});
			// add a timeout of 20 sec.
			setTimeout(function() {
				reject(new Error("script for module was not added within 20 seconds"));
			}, 20000);
		}.bind(this));

		window.aModuleExecutions = [];

		// Act:
		// first require async
		sap.ui.require(["fixture/async-sync-conflict_legacyAPIs/unique-executions"], function() {
			assert.equal(window.aModuleExecutions.length, 1, "callback for async request is called after sync request completed");
			done();
		}, done);
		// then sync -> should trigger a second request for the same resource
		sap.ui.requireSync("fixture/async-sync-conflict_legacyAPIs/unique-executions");

		// Assert:
		return scriptCompleted.then(function() {
			assert.equal(window.aModuleExecutions.length, 2, "the module should have been executed twice");
		}).finally(function() {
			delete window.aModuleExecutions;
			document.head.appendChild.restore();
		});

	});

	function testConflictScenario(assert, moduleName, moduleNameForSyncRequire, executions) {

		moduleNameForSyncRequire = moduleNameForSyncRequire || moduleName;
		executions = executions || 1;

		// preconditions
		assert.notOk(sap.ui.require(moduleName), "module must not have been loaded when the test starts");
		assert.notOk(sap.ui.require(moduleNameForSyncRequire), "module must not have been loaded when the test starts");

		// Act:
		// async request for the module
		var whenLoaded = new Promise(function(resolve, reject) {
			sap.ui.require([moduleName], function(oModuleExport) {
				assert.strictEqual(oModuleExport, window.fixture["async-sync-conflict_legacyAPIs"].EXPECTED_EXPORT, "async require should provide the expected module export");
				resolve();
			}, reject);
		});

		// conflicting sync request for the same class
		var oModuleExportSync = sap.ui.requireSync(moduleNameForSyncRequire);

		// Assert
		assert.strictEqual(oModuleExportSync, window.fixture["async-sync-conflict_legacyAPIs"].EXPECTED_EXPORT, "sync require should return the expected module export");

		return whenLoaded.then(function() {
			assert.equal(window.fixture["async-sync-conflict_legacyAPIs"].executions, executions, "required module should have been executed only once");
			assert.ok(
				!sap.ui.require.load.calledWithMatch(sinon.match.any, moduleName + ".js"),
				"module should not have been requested externally");
			assert.notOk(window.fixture["async-sync-conflict_legacyAPIs"].externalModuleLoaded, "flag for external module must not have been set");
		});

	}


	QUnit.test("Conflict for a preloaded module (sap.ui.define)", function(assert) {

		// prepare
		sap.ui.predefine("fixture/async-sync-conflict_legacyAPIs/SomeModuleUsingDefine", [], function() {
			window.fixture["async-sync-conflict_legacyAPIs"].executions++;
			return window.fixture["async-sync-conflict_legacyAPIs"].EXPECTED_EXPORT;
		});

		// Act and Assert
		return testConflictScenario(assert, "fixture/async-sync-conflict_legacyAPIs/SomeModuleUsingDefine");
	});

	QUnit.test("Conflict for a preloaded module (sap.ui.define, no matching module definition)", function(assert) {

		// prepare
		sap.ui.require.preload({
			"fixture/async-sync-conflict_legacyAPIs/SomeModuleUsingDefineNoMatch.js": function() {
				sap.ui.define("fixture/async-sync-conflict_legacyAPIs/InconsistentName", [], function() {
					window.fixture["async-sync-conflict_legacyAPIs"].executions++;
					return window.fixture["async-sync-conflict_legacyAPIs"].EXPECTED_EXPORT;
				});
			}
		});

		// Act and Assert
		return testConflictScenario(assert, "fixture/async-sync-conflict_legacyAPIs/SomeModuleUsingDefineNoMatch");
	});

	QUnit.test("Conflict for a preloaded module (jQuery.sap.declare)", function(assert) {

		// prepare
		// a substitute

		sap.ui.require.preload({
			"fixture/async-sync-conflict_legacyAPIs/SomeModuleUsingDeclare.js": function() {
				function jQuerySapDeclare(module) {
					module = module.replace(/\./g, "/") + ".js";
					sap.ui.loader._.declareModule(module);
				}
				jQuerySapDeclare("fixture.async-sync-conflict.SomeModuleUsingDeclare");
				window.fixture["async-sync-conflict_legacyAPIs"].executions++;
				window.fixture["async-sync-conflict_legacyAPIs"].SomeModuleUsingDeclare = window.fixture["async-sync-conflict_legacyAPIs"].EXPECTED_EXPORT;
			}
		});

		// Act and Assert
		return testConflictScenario(assert, "fixture/async-sync-conflict_legacyAPIs/SomeModuleUsingDeclare");

	});

	QUnit.test("Conflict for a preloaded module (jQuery.sap.declare + cycle)", function(assert) {

		// prepare
		// a substitute

		sap.ui.require.preload({
			"fixture/async-sync-conflict_legacyAPIs/SomeModuleUsingDeclareWithCycle.js": function() {
				function jQuerySapDeclare(module) {
					module = module.replace(/\./g, "/") + ".js";
					sap.ui.loader._.declareModule(module);
				}
				jQuerySapDeclare("fixture.async-sync-conflict.SomeModuleUsingDeclareWithCycle");
				window.fixture["async-sync-conflict_legacyAPIs"].executions++;
				window.fixture["async-sync-conflict_legacyAPIs"].SomeModuleUsingDeclareWithCycle = window.fixture["async-sync-conflict_legacyAPIs"].EXPECTED_EXPORT;
				sap.ui.requireSync("fixture/async-sync-conflict_legacyAPIs/SomeModuleUsingDeclareWithCycle");
			}
		});

		// Act and Assert
		// Note: When the sync/async conflict is detected, we're in the middle of the first execution.
		//       Together with the then necessary sync re-execution, we measure 2 executions.
		//       Only the delayed execution of AMD modules can prevent this
		return testConflictScenario(assert, "fixture/async-sync-conflict_legacyAPIs/SomeModuleUsingDeclareWithCycle", null, 2);

	});

	QUnit.test("Conflict for a preloaded module (global script)", function(assert) {

		// prepare
		sap.ui.require.preload({
			"fixture/async-sync-conflict_legacyAPIs/SomeGlobalScript.js": function() {
				window.fixture["async-sync-conflict_legacyAPIs"].executions++;
				window.fixture["async-sync-conflict_legacyAPIs"].SomeGlobalScript = window.fixture["async-sync-conflict_legacyAPIs"].EXPECTED_EXPORT;
			}
		});

		// Act and Assert
		return testConflictScenario(assert, "fixture/async-sync-conflict_legacyAPIs/SomeGlobalScript");

	});

	/*
	 * Case where a module A (SomeControl) modifies one of its dependencies (SomeControlRenderer).
	 * When an async / sync conflict occurs for A, the change to the dependency might get lost when the second
	 */
	QUnit.test("Conflict for a preloaded module", function(assert) {
		var done = assert.async();

		sap.ui.predefine("fixture/async-sync-conflict_legacyAPIs/SomeControl", ["fixture/async-sync-conflict_legacyAPIs/SomeControlRenderer"], function(Renderer) {
			Renderer.someProperty = "some value";
			return {};
		});

		sap.ui.predefine("fixture/async-sync-conflict_legacyAPIs/SomeControlRenderer", function() {
			return {};
		});

		// Act:
		// async request for the control class
		sap.ui.require(["fixture/async-sync-conflict_legacyAPIs/SomeControl"], function(SomeControlASync) {
			assert.ok(SomeControlASync, "control should have been loaded async");
			assert.strictEqual(sap.ui.require("fixture/async-sync-conflict_legacyAPIs/SomeControlRenderer").someProperty, "some value", "render property should have been init after async loading");
			done();
		});
		// conflicting sync request for the same class
		/* var SomeControl = */ sap.ui.requireSync("fixture/async-sync-conflict_legacyAPIs/SomeControl");

		// Assert
		assert.equal(sap.ui.require("fixture/async-sync-conflict_legacyAPIs/SomeControlRenderer").someProperty, "some value", "property should have the expected value after sync loading");
	});



	// ========================================================================================
	// Automatic Export to Global
	// ========================================================================================

	QUnit.module("Export to Global");

	QUnit.test("basic support", function(assert) {
		var done = assert.async();

		function getModule1() {
			return window.fixture && window.fixture["amd-with-export-true"] && window.fixture["amd-with-export-true"].module1;
		}

		assert.strictEqual(getModule1(), undefined, "before module execution, the namespace should not exist");
		sap.ui.require(['fixture/amd-with-export-true/module1'], function(module1) {
			assert.strictEqual(typeof module1.parentNamespace, 'object', "during module execution, the namespace should already exist");
			assert.strictEqual(module1.parentNamespace.module1, module1, "namespace member should equal the export");
			assert.strictEqual(getModule1(), module1, "after module execution, the global object should equal the export");
			done();
		});
	});



	// ========================================================================================
	// Exports of Type "Promise" (sync)
	// ========================================================================================

	QUnit.module("Promise exports");

	QUnit.test("sap.ui.requireSync", function(assert) {
		var _export = sap.ui.requireSync("fixture/exporting-promises/module-with-promise-export");
		assert.ok(isThenable(_export), "The export must be a thenable");

		var _export = sap.ui.requireSync("fixture/exporting-promises/module-with-promise-export");
		assert.ok(isThenable(_export), "The export must be a thenable also on 2nd access");
	});

	QUnit.start();
}());