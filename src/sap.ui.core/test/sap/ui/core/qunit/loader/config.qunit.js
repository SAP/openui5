/*global QUnit, requirejs, require */
(function() {
	"use strict";

	QUnit.config.autostart = false;

	/**
	 * @ui5-transform-hint replace-local true
	 */
	const INITIAL_ASYNC_MODE = false;

	var otherDefine = window.define;
	var otherRequire = window.require;
	requirejs.config({baseUrl: './'});

	var aScripts = [];

	function appendScript(sSrc, fnOnload, sId, mTagAttributes) {
		var oScript = document.createElement("script");
		oScript.src = sSrc;
		oScript.id = sId;
		Object.keys(mTagAttributes || {}).forEach(function(sAttribute) {
			oScript.setAttribute(sAttribute, mTagAttributes[sAttribute]);
		});
		oScript.addEventListener("load", fnOnload);
		document.head.appendChild(oScript);
		aScripts.push(oScript);
	}

	function startUi5Loader(callback, mTagAttributes) {
		appendScript("../../../../../../resources/ui5loader.js", function() {
			appendScript("../../../../../../resources/ui5loader-autoconfig.js", function() {
				sap.ui.loader.config({
					baseUrl: "./"
				});
				callback();
			}, "sap-ui-bootstrap", mTagAttributes);
		});
	}

	function removeUi5Loader() {
		// first restore original loader
		sap.ui.loader.config({
			amd: false
		});
		// then remove previously appended scripts
		aScripts.forEach(function(oScript) {
			document.head.removeChild(oScript);
		});
		// finally remove the whole sap namespace
		delete window.sap;
		aScripts = [];
	}



	QUnit.module("config() API", {
		afterEach: function() {
			removeUi5Loader();
		}
	});

	QUnit.test("read", function(assert){
		var done = assert.async();
		startUi5Loader(function() {

			assert.deepEqual(sap.ui.loader.config(), {async: INITIAL_ASYNC_MODE, amd: false, noConflict: true}, "Async, amdMode and noConflict flags should be returned with the expected values");

			sap.ui.loader.config({
				amd: true,
				async : true,
				map: {
					"*": {
					'prop1': 'should not be exposed'
					}
				}
			});

			assert.deepEqual(sap.ui.loader.config(), {async: true, amd: true, noConflict: false}, "Async, amdMode and noConflict flags should be returned with the expected values");
			done();

		});
	});

	QUnit.test("Make sure 'baseUrl' config option gets processed before 'paths' config option", function(assert){
		var done = assert.async();
		startUi5Loader(function() {

			assert.deepEqual(sap.ui.loader.config(), {async: INITIAL_ASYNC_MODE, amd: false, noConflict: true}, "Async, amdMode and noConflict flags should be returned with the expected values");

			// switch to 'amd' mode, as here relative paths (defined via 'paths' option)
			// are interpreted relative to the 'baseUrl', and not relative to document.baseURI
			sap.ui.loader.config({
				amd: true
			});

			// Configure 'baseUrl' after 'paths' option to test whether the 'baseUrl' is still processed before given paths are evaluated.
			require.config({
				paths: {
					"foo": "../relative/path/to/foo"
				},
				baseUrl: "./some/other/dir"
			});

			assert.ok(require.toUrl("foo").indexOf("some/other/relative/path/to/foo") !== -1, "correct baseUrl has been used to resolve paths");
			done();
		});
	});

	QUnit.test("read (after setting noConflict)", function(assert){
		var done = assert.async();
		startUi5Loader(function() {

			assert.deepEqual(sap.ui.loader.config(), {async: INITIAL_ASYNC_MODE, amd: false, noConflict: true}, "Async, amdMode and noConflict flags should be returned with the expected values");

			sap.ui.loader.config({
				noConflict: false
			});

			assert.deepEqual(sap.ui.loader.config(), {async: true, amd: true, noConflict: false}, "Async, amdMode and noConflict flags should be returned with the expected values");
			done();

		});
	});

	QUnit.test("async should be enabled after switching to amd mode", function(assert){
		var done = assert.async();
		startUi5Loader(function() {

			assert.deepEqual(sap.ui.loader.config(), {async: INITIAL_ASYNC_MODE, amd: false, noConflict: true}, "Async, amdMode and noConflict flags should be returned with the expected values");

			sap.ui.loader.config({
				amd: true
			});

			assert.deepEqual(sap.ui.loader.config(), {async: true, amd: true, noConflict: false}, "Async, amdMode and noConflict flags should be returned with the expected values");
			done();

		});
	});

	QUnit.test("async should be still enabled after switching from amd mode back to non-amd mode", function(assert){
		var done = assert.async();
		startUi5Loader(function() {

			assert.deepEqual(sap.ui.loader.config(), {async: INITIAL_ASYNC_MODE, amd: false, noConflict: true}, "Async, amdMode and noConflict flags should be returned with the expected values");

			sap.ui.loader.config({
				amd: true
			});

			assert.deepEqual(sap.ui.loader.config(), {async: true, amd: true, noConflict: false}, "Async, amdMode and noConflict flags should be returned with the expected values");

			sap.ui.loader.config({
				amd: false
			});

			assert.deepEqual(sap.ui.loader.config(), {async: true, amd: false, noConflict: true}, "Async, amdMode and noConflict flags should be returned with the expected values");

			done();

		});
	});

	QUnit.test("changing the ui5loader config from async to sync should throw an error", function(assert){
		var done = assert.async();
		startUi5Loader(function() {

			assert.deepEqual(sap.ui.loader.config(), {async: INITIAL_ASYNC_MODE, amd: false, noConflict: true}, "Async, amdMode and noConflict flags should be returned with the expected values");

			sap.ui.loader.config({
				async: true
			});

			assert.deepEqual(sap.ui.loader.config(), {async: true, amd: false, noConflict: true}, "Async, amdMode and noConflict flags should be returned with the expected values");

			assert.throws(function () {
				sap.ui.loader.config({
					async: false
				});
			}, "An error is thrown when changing the ui5loader config from async to sync. This is not supported. Only a change from sync to async is allowed.");

			done();

		});
	});


	/**
	 * @deprecated
	 */
	QUnit.module("Config variants for async", {
		afterEach: function() {
			removeUi5Loader();
		}
	});

	QUnit.test("xx-async=true", function(assert){
		var done = assert.async();
		startUi5Loader(function() {

			assert.strictEqual(sap.ui.loader.config().async, true, "Async mode should have been activated by data-sap-ui-xx-async attribute");
			done();

		}, {"data-sap-ui-xx-async": "true"});
	});

	QUnit.test("async=true", function(assert){
		var done = assert.async();
		startUi5Loader(function() {

			assert.strictEqual(sap.ui.loader.config().async, true, "Async mode should have been activated by data-sap-ui-async attribute");
			done();

		}, {"data-sap-ui-async": "true"});
	});

	/**
	 * @deprecated As of version 1.120 as the loader will no longer support sync mode in the next major release
	 */
	QUnit.test("async=false", function(assert){
		var done = assert.async();
		startUi5Loader(function() {

			assert.strictEqual(sap.ui.loader.config().async, false, "Async mode should have been activated by data-sap-ui-async attribute");
			done();

		}, {"data-sap-ui-async": "false"});
	});



	QUnit.module("Coexistence with AMD loaders", {
		afterEach: function() {
			removeUi5Loader();
		}
	});

	QUnit.test("Default behavior", function(assert) {
		var done = assert.async();

		assert.equal(typeof otherRequire, 'function', "[precondition] global require should be a function (other than UI5)");
		assert.equal(typeof otherDefine, 'function', "[precondition] global define should be a function (other than UI5)");
		startUi5Loader(function() {
			assert.strictEqual(window.require, otherRequire, "global require still should be the same function after starting the ui5loader");
			assert.strictEqual(window.define, otherDefine, "global define still should be the same function after starting the ui5loader");
			done();
		});
	});

	QUnit.test("Expose loader via config() API", function(assert) {
		var done = assert.async();
		var requirejsLoadedModule, requirejsLoadedModuleAgain;

		require(["fixture/basic/amdModule"], function(amdModule) {

			requirejsLoadedModule = amdModule;

			startUi5Loader(function useUi5Loader() {
				var privateLoaderAPI = sap.ui.loader._;

				// make ui5loader act as an AMD loader
				sap.ui.loader.config({
					amd: true
				});

				assert.notStrictEqual(window.require, otherRequire, "global require should have changed");
				assert.notStrictEqual(window.define, otherDefine, "global define should have changed");
				assert.strictEqual(window.require, privateLoaderAPI.amdRequire, "global require should be the UI5 implementation");
				assert.strictEqual(window.define, privateLoaderAPI.amdDefine, "global define should be the UI5 implementation");

				require(['fixture/basic/ui5Module'], function(ui5LoadedModule) {

					assert.throws(function() {
						otherRequire('fixture/basic/ui5Module');
					}, "other loader shouldn't know the UI5 module");

					// hide UI5 implementation again
					sap.ui.loader.config({
						amd: false
					});

					assert.strictEqual(window.require, otherRequire, "global require should be the 'other' loader's implementation again");
					assert.strictEqual(window.define, otherDefine, "global define should be the 'other' loader's implementation again");

					// Use requiresjs again (module should be returned from requirejs cache)
					requirejsLoadedModuleAgain = require("fixture/basic/amdModule");

					assert.ok(requirejsLoadedModule, "AMD module has been loaded via requirejs");
					assert.ok(ui5LoadedModule, "UI5 module has been loaded via UI5 Loader");
					assert.strictEqual(requirejsLoadedModule, requirejsLoadedModuleAgain, "Modules loaded by the 'other' loader should be the same");

					done();
				});
			});
		});
	});

	/**
	 * @deprecated
	 */
	QUnit.test("Expose loader via bootstrap attribute", function(assert) {
		var done = assert.async();

		assert.strictEqual(window.require, otherRequire, "global require should be the 'other' loader's implementation again");
		assert.strictEqual(window.define, otherDefine, "global define should be the 'other' loader's implementation again");

		startUi5Loader(function() {
			var privateLoaderAPI = sap.ui.loader._;

			assert.notStrictEqual(window.require, otherRequire, "global require should have changed");
			assert.notStrictEqual(window.define, otherDefine, "global define should have changed");
			assert.strictEqual(window.require, privateLoaderAPI.amdRequire, "global require should be the UI5 implementation");
			assert.strictEqual(window.define, privateLoaderAPI.amdDefine, "global define should be the UI5 implementation");

			// hide UI5 implementation again
			sap.ui.loader.config({
				amd: false
			});

			assert.strictEqual(window.require, otherRequire, "global require should be the 'other' loader's implementation again");
			assert.strictEqual(window.define, otherDefine, "global define should be the 'other' loader's implementation again");

			done();
		}, {"data-sap-ui-amd": "true"});
	});

	QUnit.module("Bootstrap config");

	QUnit.test("Expose loader via bootstrap attribute", function(assert) {
		const done = assert.async(),
			startCore = (callback, mTagAttributes) => {
			appendScript("../../../../../../resources/sap-ui-core.js", function() {
				sap.ui.loader.config({
					baseUrl: "./"
				});
				callback();
			}, "sap-ui-bootstrap", mTagAttributes);
		};

		assert.strictEqual(window.require, otherRequire, "global require should be the 'other' loader's implementation again");
		assert.strictEqual(window.define, otherDefine, "global define should be the 'other' loader's implementation again");

		startCore(function() {
			var privateLoaderAPI = sap.ui.loader._;

			assert.notStrictEqual(window.require, otherRequire, "global require should have changed");
			assert.notStrictEqual(window.define, otherDefine, "global define should have changed");
			assert.strictEqual(window.require, privateLoaderAPI.amdRequire, "global require should be the UI5 implementation");
			assert.strictEqual(window.define, privateLoaderAPI.amdDefine, "global define should be the UI5 implementation");

			// hide UI5 implementation again
			sap.ui.loader.config({
				amd: false
			});

			assert.strictEqual(window.require, otherRequire, "global require should be the 'other' loader's implementation again");
			assert.strictEqual(window.define, otherDefine, "global define should be the 'other' loader's implementation again");

			done();
		}, {"data-sap-ui-amd": "true"});
	});

	QUnit.start();
}());
