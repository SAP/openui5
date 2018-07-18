/* global QUnit, sinon, ES6Promise */
(function() {
	"use strict";

	// Promise polyfill needs to be applied manually before
	// the loader is executed, as the test itself uses promises
	if (typeof Promise === "undefined") {
		ES6Promise.polyfill();
	}

	QUnit.config.autostart = false;

	var aScripts = [];

	function appendScript(sSrc, fnOnload, sId) {
		var oScript = document.createElement("script");
		oScript.src = sSrc;
		oScript.id = sId;
		oScript.addEventListener("load", fnOnload);
		document.head.appendChild(oScript);
		aScripts.push(oScript);
	}

	function startup() {
		return new Promise(function(resolve, reject) {

			function includeLoaderScripts(callback) {
				// Load ui5loader without requiring Core.js to be able to require stubs individually
				appendScript("../../../../../resources/ui5loader.js", function() {

					sap.ui.loader._.logger = {
						debug: function() {
							// Prevent spamming the conosle with unnecessary info
							//console.log.apply(console, arguments); // eslint-disable-line no-console
						},
						info: function() {
							// Prevent spamming the conosle with unnecessary info
							//console.log.apply(console, arguments); // eslint-disable-line no-console
						},
						warning: function() {
							console.warn.apply(console, arguments); // eslint-disable-line no-console
						},
						error: function() {
							console.error.apply(console, arguments); // eslint-disable-line no-console
						},
						isLoggable: function() { return true; }
					};

					appendScript("../../../../../resources/ui5loader-autoconfig.js", callback, "sap-ui-bootstrap");
				});
			}

			includeLoaderScripts(function() {

				// Loading of jquery.sap.stubs needs to be delayed so that the define calls within
				// ui5loader-autoconfig.js are executed first. This might happen in PhantomJS or
				// Chrome when the tab is inactive.
				// See @evo-todo in ui5loader-autoconfig.js
				setTimeout(function() {

					// Enable exporting stubbing config
					window["jquery.sap.stubs-test"] = true;

					// Load stubbing layer and resolve/reject promise
					sap.ui.require(["jquery.sap.stubs"], function() {

						// Read exported stubbing config and remove globals
						var mStubs = window["jquery.sap.stubs-test"];
						delete window["jquery.sap.stubs-test"];

						resolve(mStubs);
					}, reject);

				});

			});

		});
	}

	function shutdown() {
		// Remove previously appended scripts
		aScripts.forEach(function(oScript) {
			document.head.removeChild(oScript);
		});

		// finally remove the global namespaces
		delete window.sap;
		delete window.jQuery;
		aScripts = [];
	}

	function isStubbed(oTarget, sProperty) {
		var oDescriptor = Object.getOwnPropertyDescriptor(oTarget, sProperty);
		return !!(oDescriptor && oDescriptor.get && oDescriptor.get["jquery.sap.stubs"]);
	}

	function defineModule(sName) {
		QUnit.module(sName, {
			startup: function() {
				return startup().then(function(mStubs) {
					// Note: Log is used within jquery.sap.stubs, so it should be loaded already
					var Log = sap.ui.require("sap/base/Log");
					this.oDebugLogSpy = this.spy(Log, "debug");

					return mStubs;
				}.bind(this));
			},
			afterEach: function() {
				shutdown();
			}
		});
	}

	function defineLazyLoadingTest(sStubName, sProperty, sModule) {
		QUnit.test(sStubName + sProperty, function(assert) {
			return this.startup().then(function(mStubs) {

				// Make sure to get correct target reference as the stubbing layer is loaded for each test
				var oTarget = mStubs[sStubName].target;

				assert.ok(isStubbed(oTarget, sProperty), "Property '" + sProperty + "' should be stubbed.");

				// Trigger stubbing layer by accessing the property
				var vValue = oTarget[sProperty];

				// Stub should lazy load the module
				sinon.assert.calledWith(this.oDebugLogSpy,
					sinon.match("Lazy loading module"),
					"jquery.sap.stubs"
				);

				assert.ok(!isStubbed(oTarget, sProperty), "Property '" + sProperty + "' should not be stubbed anymore.");

				assert.ok(typeof vValue !== "undefined", "Property  '" + sProperty + "' should have a value");
				assert.ok(sap.ui.require(sModule), "Underlaying module should have been loaded");

			}.bind(this));
		});
	}

	function defineStubReplacementTest(sStubName, sProperty, sModule) {
		QUnit.test(sStubName + sProperty, function(assert) {
			return this.startup().then(function(mStubs) {

				// Make sure to get correct target reference as the stubbing layer is loaded for each test
				var oTarget = mStubs[sStubName].target;

				assert.ok(isStubbed(oTarget, sProperty), "Property '" + sProperty + "' should be stubbed.");

				// Load underlaying module
				return new Promise(function(resolve, reject) {
					sap.ui.require([sModule], resolve, reject);
				}).then(function() {

					// Stub should not lazy load the module
					sinon.assert.neverCalledWith(this.oDebugLogSpy,
						sinon.match("Lazy loading module"),
						"jquery.sap.stubs"
					);

					assert.ok(!isStubbed(oTarget, sProperty), "Property '" + sProperty + "' should not be stubbed anymore.");

					// Access previously stubbed property
					var vValue = oTarget[sProperty];

					assert.ok(typeof vValue !== "undefined", "Property  '" + sProperty + "' should have a value");

				}.bind(this));
			}.bind(this));
		});
	}

	function getTestMode() {
		return new Promise(function(resolve, reject) {
			sap.ui.require(["sap/base/util/UriParameters"], resolve, reject);
		}).then(function (UriParameters) {
			return new UriParameters(document.location.href).get("test-mode") || "all";
		});
	}

	// Running startup once to define tests
	startup().then(function(mStubs) {
		return getTestMode().then(function(sTestMode) {
			Object.keys(mStubs).forEach(function(sStubName) {
				var oStub = mStubs[sStubName];
				var oStubs = oStub.stubs;

				Object.keys(oStubs).forEach(function(sModule) {
					var aProperties = oStubs[sModule].map(function(vProperty) {
						return typeof vProperty === "object" ? vProperty : { name: vProperty };
					});

					if (sTestMode === "all" || sTestMode === "lazy-loading") {
						defineModule(sModule + ": Lazy loading");
						aProperties.forEach(function(oProperty) {
							defineLazyLoadingTest(sStubName, oProperty.name, sModule);
						});
					}

					if (sTestMode === "all" || sTestMode === "stub-replacement") {
						defineModule(sModule + ": Stub replacement");
						aProperties.forEach(function(oProperty) {
							defineStubReplacementTest(sStubName, oProperty.name, sModule);
						});
					}

				});

			});
		});
	}).then(function() {
		shutdown();
		QUnit.start();
	}, function(err) {
		// No shutdown here, to enable easier investiation into the error
		QUnit.test("Error during test setup", function(assert) {
			assert.ok(false, err + "\n" + err.stack);
		});
		QUnit.start();
	});

})();
