/*global QUnit */

QUnit.config.autostart = false;
QUnit.config.reorder = false;

sap.ui.require(["sap/base/util/fetch"], function (fetch) {
	"use strict";

	// check for server side code coverage (SSCC)
	// The instrumented code doesn't fit to the assumptions made by this test -> skip
	var bInstrumentedCode = window["sap-ui-qunit-coverage"] === "server";

	// check for the existence of a wellknown debug source as indicator for optimized sources
	var bDebugModules = false;
	fetch('../../../../../../resources/sap/ui/core/HTML-dbg.js', {
		method: 'HEAD'
	}).then(function (oHTMLDbgResponse) {
		bDebugModules = !!oHTMLDbgResponse.ok;
	}).finally(function () {
		/*
		 * Check whether the current environment allows to run the test.
		 *
		 * If not, all tests are run with test method 'skip'. If yes,
		 * one of the test modules is switched to method 'test'.
		 * It depends on the sap-ui-debug setting, which module is activated.
		 *
		 * The precondition should always run, either with method 'todo' to document
		 * what precondtion was not met or with 'test' to document the findings.
		 * But due to restrictions of qunit-junit/qunit-callback which both can't handle 'todo',
		 * reporting currently is also skipped when preconditions are not met.
		 */
		var precondition = 'skip'; // TODO should be 'todo'
		var full = 'skip';
		var partial = 'skip';
		var off = 'skip';
		if ( bDebugModules
			 && !bInstrumentedCode
			 && performance
			 && typeof performance.getEntriesByType === 'function'
			 && performance.getEntriesByType('resource').length > 0 ) {
			precondition = 'test';
			if ( window['sap-ui-debug'] === true ) {
				full = 'test';
			} else if ( typeof window['sap-ui-debug'] === 'string' ) {
				partial = 'test';
			} else {
				off = 'test';
			}
		} else {
			// Create dummy test to report a "successful" test run.
			// Ideally the skipped tests should be marked as "todo" instead of "skip"
			// but this is not supported by the test reporting infrastructure
			QUnit.test("Preconditions not met - skipping all tests", function(assert) {
				assert.ok(true, "Preconditions not met - skipping all tests");
			});
		}

		/*
		 * Checks whether the recorded resource requests contain a request for the given resource
		 */
		function hasRequest(vExpectedResource) {
			var aResources = performance.getEntriesByType("resource");
			var i = 0;
			while ( i < aResources.length ) {
				var oResource = aResources[i];
				var match = false;
				if ( vExpectedResource instanceof RegExp ) {
					match = vExpectedResource.test(oResource.name);
				} else {
					match = oResource.name.indexOf(vExpectedResource) >= 0;
				}
				if (match) {
					return true;
				}
				i++;
			}
		}

		/*
		 * Checks whether the recorded resource requests contain requests for all given resource names
		 * in exactly the given order.
		 */
		function hasRequestSequence(aExpectedResources) {
			var aResources = performance.getEntriesByType("resource");
			var aResourcesToCheck = aExpectedResources.slice();
			var i = 0;
			while ( i < aResources.length && aResourcesToCheck.length > 0 ) {
				var oResource = aResources[i];
				var match = false;
				if ( aResourcesToCheck[0] instanceof RegExp ) {
					match = aResourcesToCheck[0].test(oResource.name);
				} else {
					match = oResource.name.indexOf(aResourcesToCheck[0]) >= 0;
				}
				if ( match ) {
					aResourcesToCheck.shift();
				}
				i++;
			}
			return aResourcesToCheck.length === 0;
		}

		// ---- precondition ---------------------------------------------

		QUnit.module('Preconditions');

		QUnit[precondition]("Productive Sources and Performance Web API", function(assert) {
			assert.equal(bDebugModules, true, "existance of sap/ui/core/Core-dbg.js resource indicates productive + debug sources");
			assert.ok(performance, "Performance API should be available");
			assert.equal(typeof performance.getEntriesByType, 'function', "performance.getEntriesByType method is needed");
			assert.notEqual(performance.getEntriesByType('resource').length, 0, "performance.getEntriesByType() should return non-empty array");
		});

		// ---- full debug mode -------------------------------------------

		QUnit.module('Full Debug Mode');

		QUnit[full]("Bootstrap", function(assert) {
			assert.ok(hasRequestSequence(['sap-ui-core.js','sap-ui-core-dbg.js']), "bootstrap code should be loaded as debug sources");
		});

		QUnit[full]("Control Code", function(assert) {
			var done = assert.async();
			sap.ui.require(['sap/m/Table'], function() {
				assert.ok(hasRequestSequence(['sap/m/Table-dbg.js','sap/m/ListBase-dbg.js']), "table should be loaded as debug source");
				assert.ok(!hasRequest('sap/m/Table.js'), "table should not be loaded as normal source");
				done();
			});
		});

		QUnit[full]("Application Test Code", function(assert) {
			var done = assert.async();
			sap.ui.require(['fixture/debug-mode/Component'], function(AppComponent) {
				AppComponent.then(function () {
					assert.ok(hasRequest('fixture/debug-mode/Component-dbg.js'),
							"debug version Component-dbg.s should have been requested");
					assert.ok(hasRequest('fixture/debug-mode/view/Main-dbg.view.js'),
							"debug version of JSView should have been requested");
					assert.ok(hasRequest('fixture/debug-mode/controller/Main-dbg.controller.js'),
							"debug version of controller should have been requested");
					assert.ok(hasRequest('fixture/debug-mode/view/Main.view.xml'),
							"standard version of XMLView should have been requested"); // no -dbg loading for xml resources!
					done();
				});
			});
		});

		// ---- partial debug mode -------------------------------------------

		QUnit.module('Partial Debug Mode');

		QUnit[partial]("Configuration", function(assert) {
			// ensure that the partial debug mode is configured with the expected filter
			assert.equal(window['sap-ui-debug'], 'sap/m/ListBase,fixture/debug-mode/', "partial debug mode should be configured with the expected filter");
		});

		QUnit[partial]("Bootstrap", function(assert) {
			assert.ok(hasRequest('sap-ui-core.js'), "bootstrap code should have been loaded as normal sources");
			assert.ok(!hasRequest('sap-ui-core-dbg.js'), "debug version of bootstrap code must not have been requested");
		});

		QUnit[partial]("Control Code", function(assert) {
			var done = assert.async();
			sap.ui.require(['sap/m/Table'], function() {
				assert.ok(!hasRequest('sap/m/Table'), "no resource should have been requested for Table (not configured for partial debug)");
				assert.ok(hasRequest('sap/m/ListBase-dbg.js'), "ListBase-dbg should have been requested (matches filter)");
				assert.ok(!hasRequest('sap/m/ListBase.js'), "ListBase.js should not have been requested (debug version already loaded)");
				done();
			});
		});

		QUnit[partial]("Application Test Code", function(assert) {
			var done = assert.async();
			sap.ui.require(['fixture/debug-mode/minified-module', 'fixture/debug-mode/non-minified-module'], function(minifiedModule,nonMinifiedModule) {
				assert.deepEqual(minifiedModule, {}, "minified-module should have expected export");
				assert.deepEqual(nonMinifiedModule, {}, "non-minified-module should have expected export");
				assert.ok(hasRequest('fixture/debug-mode/minified-module-dbg.js'),
						"debug version of minified-module should have been requested");
				assert.ok(!hasRequest('fixture/debug-mode/minified-module.js'),
						"standard version of minified-module must not have been requested");
				assert.ok(hasRequest('fixture/debug-mode/non-minified-module-dbg.js') || true, // 404s are not recorded in Chrome!
						"request for debug version of non-minified-module may have been recorded)");
				assert.ok(hasRequest('fixture/debug-mode/non-minified-module.js'),
						"standard version of non-minified-module should have been requested (no debug version available)");
				done();
			});
		});

		// ---- debug mode off -------------------------------------------

		QUnit.module('Debug Mode Off');

		QUnit[off]("Bootstrap", function(assert) {
			assert.ok(hasRequest('sap-ui-core.js'), "bootstrap code should have been loaded as normal sources");
			assert.ok(!hasRequest('sap-ui-core-dbg.js'), "debug version of bootstrap code must not have been requested");
		});

		QUnit[off]("Control Code", function(assert) {
			var done = assert.async();
			var bPreloadActive = false;

			fetch('../../../../../../resources/sap/m/library-preload.js', {
				method: 'HEAD'
			}).then(function (oPreloadResponse) {
				bPreloadActive = !!oPreloadResponse.ok && hasRequest('sap/m/library-preload.js');
			}).finally(function () {
				if ( bPreloadActive ) {
					assert.ok(!!sap.ui.loader._.getModuleState('sap/m/Table.js'), "Table resource should be in status 'loaded' (as preloads are active)");
				}
				assert.ok(sap.ui.require('sap/m/Table') === undefined, "Table must not have been required yet");
				sap.ui.require(['sap/m/Table'], function(Table) {
					assert.ok(!!Table, "Table module should have been required");
					if ( bPreloadActive ) {
						assert.ok(!hasRequest('sap/m/Table'), "table should not have been requested as individual resource (as preloads are active)");
					}
					done();
				});
			});
		});

		QUnit[off]("Application Test Code", function(assert) {
			var done = assert.async();
			sap.ui.require(['fixture/debug-mode/minified-module'], function(module1) {
				assert.ok(hasRequest('fixture/debug-mode/minified-module.js'), "standard version of minified-module should have been requested");
				assert.ok(!hasRequest('fixture/debug-mode/minified-module-dbg.js'), "debug version of minified-module must not have been requested");
				done();
			});
		});

		// ---- start tests -------------------

		QUnit.start();
	});

});