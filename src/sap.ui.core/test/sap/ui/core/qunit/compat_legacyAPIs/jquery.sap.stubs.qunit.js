/* global QUnit, sinon */
(function () {
	"use strict";

	QUnit.config.autostart = false;

	function beforeEach() {
		return new Promise(function (resolve, reject) {

			// Enable exporting stubbing config
			window["jquery.sap.stubs-test"] = true;

			// Load stubbing layer and resolve/reject promise
			sap.ui.require(["jquery.sap.stubs"], function () {

				// Read exported stubbing config and remove globals
				var mStubs = window["jquery.sap.stubs-test"];
				delete window["jquery.sap.stubs-test"];

				resolve(mStubs);
			}, reject);

		});
	}

	function afterEach(mStubs) {

		// Unload stubbing module
		sap.ui.loader._.unloadResources("jquery.sap.stubs.js", false, true, true);

		// Unload all modules which will be loaded by triggering a stub
		Object.keys(mStubs).forEach(function (sStubName) {
			var oStub = mStubs[sStubName];
			var oStubs = oStub.stubs;
			Object.keys(oStubs).forEach(function (sModule) {
				sap.ui.loader._.unloadResources(sModule + ".js", false, true, true);
			});
		});

		// Unload jQuery and remove global variable
		sap.ui.loader._.unloadResources("sap/ui/thirdparty/jquery.js", false, true, true);
		delete window.jQuery;
	}

	function isStubbed(oTarget, sProperty) {
		var oDescriptor = Object.getOwnPropertyDescriptor(oTarget, sProperty);
		return !!(oDescriptor && oDescriptor.get && oDescriptor.get["jquery.sap.stubs"]);
	}

	function defineModule(sName) {
		QUnit.module(sName, {
			startup: function () {
				return beforeEach().then(function (mStubs) {
					this.mStubs = mStubs;

					// Note: Log is used within jquery.sap.stubs, so it should be loaded already
					var Log = sap.ui.require("sap/base/Log");
					this.oWarningLogSpy = this.spy(Log, "warning");

					return mStubs;
				}.bind(this));
			},
			afterEach: function () {
				afterEach(this.mStubs);
			}
		});
	}

	var TEST_TYPE = {
		"LAZY_LOADING": "lazy-loading",
		"STUB_REPLACEMENT": "stub-replacement"
	};
	var defineTest = {};

	defineTest[TEST_TYPE.LAZY_LOADING] = function (sStubName, sProperty, sModule) {
		QUnit.test(sStubName + sProperty, function (assert) {
			return this.startup().then(function (mStubs) {

				// Make sure to get correct target reference as the stubbing layer is loaded for each test
				var oTarget = mStubs[sStubName].target;

				assert.ok(isStubbed(oTarget, sProperty), "Property '" + sProperty + "' should be stubbed.");

				// Trigger stubbing layer by accessing the property
				var vValue = oTarget[sProperty];

				// Stub should lazy load the module
				sinon.assert.calledWith(this.oWarningLogSpy,
					sinon.match("Sync loading of module"),
					"jquery.sap.stubs"
				);

				assert.ok(!isStubbed(oTarget, sProperty), "Property '" + sProperty + "' should not be stubbed anymore.");

				assert.ok(typeof vValue !== "undefined", "Property  '" + sProperty + "' should have a value");
				assert.ok(sap.ui.require(sModule), "Underlaying module should have been loaded");

			}.bind(this));
		});
	};
	defineTest[TEST_TYPE.STUB_REPLACEMENT] = function (sStubName, sProperty, sModule) {
		QUnit.test(sStubName + sProperty, function (assert) {
			return this.startup().then(function (mStubs) {

				// Make sure to get correct target reference as the stubbing layer is loaded for each test
				var oTarget = mStubs[sStubName].target;

				assert.ok(isStubbed(oTarget, sProperty), "Property '" + sProperty + "' should be stubbed.");

				// Load underlaying module
				return new Promise(function (resolve, reject) {
					sap.ui.require([sModule], resolve, reject);
				}).then(function () {

					// Stub should not lazy load the module
					sinon.assert.neverCalledWith(this.oWarningLogSpy,
						sinon.match("Sync loading of module"),
						"jquery.sap.stubs"
					);

					assert.ok(!isStubbed(oTarget, sProperty), "Property '" + sProperty + "' should not be stubbed anymore.");

					// Access previously stubbed property
					var vValue = oTarget[sProperty];

					assert.ok(typeof vValue !== "undefined", "Property  '" + sProperty + "' should have a value");

				}.bind(this));
			}.bind(this));
		});
	};

	function defineTestCategory(oContext, oConfig, sTestType) {
		if (oConfig.mode === "all" || oConfig.mode === sTestType) {
			defineModule(oContext.moduleName);
			oContext.properties.forEach(function (sProperty) {
				oConfig.i++;
				if (!oConfig.runInChunks || (oConfig.i >= oConfig.start && oConfig.i <= oConfig.end)) {
					oConfig.testsDefined++;
					defineTest[sTestType](oContext.stubName, sProperty, oContext.module);
				}
			});
		}
	}

	function getTestConfig() {
		var oParams = new URLSearchParams(document.location.search);
		var oConfig = {};

		oConfig.mode = oParams.get("test-mode") || "all";
		if (oParams.get("chunk")) {
			oConfig.chunk = parseInt(oParams.get("chunk"));
		}

		// Chunk paging logic
		oConfig.i = 0;
		oConfig.testsDefined = 0;
		oConfig.runInChunks = !!oConfig.chunk;
		if (oConfig.chunk) {
			oConfig.start = ((oConfig.chunk - 1) * 50) + 1;
			oConfig.end = (oConfig.chunk) * 50;
		}

		return Promise.resolve(oConfig);
	}

	// Running startup once to define tests
	beforeEach().then(function (mStubs) {
		return getTestConfig().then(function (oConfig) {
			var bLoaderAsync = sap.ui.loader.config().async;

			document.title = "QUnit tests for jquery.sap.stubs: " +
				(bLoaderAsync ? "async, " : "sync, ") +
				oConfig.mode +
				(oConfig.runInChunks ? (", chunk " + oConfig.chunk) : "");

			Object.keys(mStubs).forEach(function (sStubName) {
				var oStub = mStubs[sStubName];
				var oStubs = oStub.stubs;

				Object.keys(oStubs).forEach(function (sModule) {
					var aProperties = oStubs[sModule];

					defineTestCategory({
						moduleName: sModule + ": Lazy loading " + (bLoaderAsync ? " (async)" : "(sync)"),
						module: sModule,
						stubName: sStubName,
						properties: aProperties
					}, oConfig, TEST_TYPE.LAZY_LOADING);

					defineTestCategory({
						moduleName: sModule + ": Stub replacement " + (bLoaderAsync ? " (async)" : "(sync)"),
						module: sModule,
						stubName: sStubName,
						properties: aProperties
					}, oConfig, TEST_TYPE.STUB_REPLACEMENT);

				});
			});

			if (oConfig.testsDefined === 0) {
				QUnit.test("No tests defined!", function (assert) {
					assert.ok(false, "No tests have been defined. Please check the URL parameters");
				});
			}

		}).then(function () {
			afterEach(mStubs);
		});
	}).then(function () {
		QUnit.start();
	}, function (err) {
		QUnit.test("Error during test setup", function (assert) {
			assert.ok(false, err + "\n" + err.stack);
		});
		QUnit.start();
	});

})();
