/*global QUnit, define, require, fixture */
(function() {
	"use strict";

	sap.ui.loader.config({
		amd: true,
		baseUrl: "./"
	});

	QUnit.module("amd=true mode");

	/**
	 * @deprecated As of version 1.120, the ui5loader no longer implements bExport
	 */
	QUnit.test("amd - bExport - error message", function(assert) {
		var done = assert.async();

		require(["fixture/error-handling-standard-api/amdModule"], function () {
			// ------ ALL parameters -------
			define("sap/test/MockModule", [], function () {
				return {};
			}, /* bExport = */ true);

			define("sap/test/MockModule2", [], function () {
				return {};
			});

			// ------ Optional dependencies -------
			define("sap/test/MockModule3", function () {
				return {};
			}, /* bExport = */ true);

			define("sap/test/MockModule4", function () {
				return {};
			});


			// Waiting for loader queue to be processed
			setTimeout(function() {

				assert.throws(
					function() {
						return sap.test.MockModule;
					},
					TypeError,
					"sap.test.MockModule was not exported"
				);

				assert.throws(
					function() {
						return sap.test.MockModule2;
					},
					TypeError,
					"sap.test.MockModule2 was not exported"
				);

				assert.throws(
					function() {
						return sap.test.MockModule3;
					},
					TypeError,
					"sap.test.MockModule3 was not exported"
				);

				assert.throws(
					function() {
						return sap.test.MockModule4;
					},
					TypeError,
					"sap.test.MockModule4 was not exported"
				);

				assert.throws(
					function() {
						return fixture["error-handling-standard-api"].amdModule;
					},
					ReferenceError,
					"fixture.error-handling-standard-api.amdModule was not exported"
				);

				done();
			});
		}, function(oErr) {
			assert.strictEqual({}, oErr, "require must not fail");
		});
	});

	QUnit.test("amd - require string probing - simple", function(assert) {
		var oTable = sap.ui.require("sap/m/Table");
		assert.strictEqual(oTable, undefined, "ui5 require returns undefined for not loaded modules");

		assert.throws(
			function() {
				require("fixture/basic/amdModule");
			},
			new Error("Module 'fixture/basic/amdModule.js' has not been loaded yet. Use require(['fixture/basic/amdModule.js']) to load it."),
			"fixture.error-handling-standard-api.amdModule was not exported"
		);

	});

	QUnit.test("amd - require string probing - no return value", function (assert) {
		var done = assert.async();

		// inline module with no return value
		define("sap/test/A", function () {
			return undefined;
		});

		// after 'someone' required the module ...
		require(['sap/test/A'], function() {

			// ... the probing API should succeed
			var x = require("sap/test/A");

			assert.strictEqual(x, undefined, "undefined is returned");
			assert.ok(true, "require('...') for empty inline Module in READY state does not fail");

			// loading a module with no return value
			define("sap/test/B", ["fixture/error-handling-standard-api/amdModule_undef"], function (amdModule_undef) {
				var y = require("fixture/error-handling-standard-api/amdModule_undef");

				assert.strictEqual(y, undefined, "undefined is returned");
				assert.ok(true, "require('...') for an empty already loaded Module in READY state does not fail");

				done();
			});
		});
	});

	QUnit.test("amd - local require string probing", function(assert) {
		var done = assert.async();

		sap.ui.define("sap/test/localRequire01", ["require"], function (require) {

			assert.throws(
				function() {
					require("fixture/error-handling-standard-api/amdModule2");
				},
				new Error("Module 'fixture/error-handling-standard-api/amdModule2.js' has not been loaded yet. Use require(['fixture/error-handling-standard-api/amdModule2.js']) to load it."),
				"Module 'fixture/error-handling-standard-api/amdModule2.js' has not been loaded yet"
			);

			define("sap/test/2ndRequire01", ["require"], function (require) {
				// local require should fail with an error if the module was not loaded yet
				assert.throws(
					function() {
						require("fixture/error-handling-standard-api/amdModule2");
					},
					new Error("Module 'fixture/error-handling-standard-api/amdModule2.js' has not been loaded yet. Use require(['fixture/error-handling-standard-api/amdModule2.js']) to load it."),
					"Module 'fixture/error-handling-standard-api/amdModule2.js' has not been loaded yet"
				);

				done();
			});
		});
	});

	QUnit.test("amd - local require - loaded modules", function(assert) {
		var done = assert.async();

		sap.ui.define("sap/test/localRequire02", ["require"], function (require) {
			// local require should fail with an error if the module was not loaded yet
			assert.throws(
				function() {
					require("fixture/error-handling-standard-api/amdModule2");
				},
				new Error("Module 'fixture/error-handling-standard-api/amdModule2.js' has not been loaded yet. Use require(['fixture/error-handling-standard-api/amdModule2.js']) to load it."),
				"Module 'fixture/error-handling-standard-api/amdModule2.js' has not been loaded yet"
			);

			var oSapReturn = sap.ui.require("fixture/error-handling-standard-api/amdModule2");
			assert.strictEqual(oSapReturn, undefined, "sap.ui.require(): returns undefined for missing module");

			define("sap/test/2ndRequire02", ["require", "fixture/error-handling-standard-api/amdModule2"], function (require, amdModule) {
				// local require should return the module if it was already loaded
				var oAmdReturn = require("fixture/error-handling-standard-api/amdModule2");
				assert.strictEqual(oAmdReturn, amdModule, "require(): Module was correctly returned");

				var oSapReturn = sap.ui.require("fixture/error-handling-standard-api/amdModule2");
				assert.strictEqual(oSapReturn, amdModule, "sap.ui.require(): Module was correctly returned");

				done();
			});
		});
	});

	QUnit.test("ui5loader config - async", function(assert) {

		sap.ui.loader.config({
			async: true
		});

		assert.throws(function () {
			sap.ui.loader.config({
				async: false
			});
		},
		new Error("Changing the ui5loader config from async to sync is not supported. Only a change from sync to async is allowed."),
		"Changing from async to sync leads to an error");
	});

}());
