/*global QUnit sinon*/
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/ResourceBundle",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Lib",
	"sap/ui/dom/includeScript"
], function(Log, ResourceBundle, LoaderExtensions, Library, includeScript) {
	"use strict";

	QUnit.config.reorder = false;

	QUnit.module("Instance methods");

	QUnit.test("Constructor isn't allowed to be called", function(assert) {
		assert.throws(function() {
			var oLib = new Library({
				name: "my.library"
			});
			return oLib;
		}, /The constructor of sap\/ui\/core\/Lib is restricted to the internal usage/, "Calling constructor throws an error");
	});

	QUnit.test("Instance method 'enhanceSettings' and 'isSettingsEnhanced'", function(assert) {
		var oLib = Library._get("my.library", true);
		assert.strictEqual(oLib.isSettingsEnhanced(), false, "'isSettingsEnhanced' should return false before calling 'enhanceSettings'");

		assert.deepEqual(oLib.dependencies, [], "default value should be provided for 'dependencies'");
		assert.deepEqual(oLib.types, [], "default value should be provided for 'types'");
		assert.deepEqual(oLib.interfaces, [], "default value should be provided for 'interfaces'");
		assert.deepEqual(oLib.controls, [], "default value should be provided for 'controls'");
		assert.deepEqual(oLib.elements, [], "default value should be provided for 'elements'");

		oLib.enhanceSettings({
			name: "my.new.name",
			types: ["my.library.types.Type1", "my.library.types.Type2"],
			p1: "string",
			p2: ["element1", "element2"]
		});

		assert.strictEqual(oLib.isSettingsEnhanced(), true, "'isSettingsEnhanced' should return true after calling 'enhanceSettings'");

		assert.strictEqual(oLib.name, "my.library", "'name' that is given in calling 'enhanceSettings' should not be taken");
		assert.strictEqual(oLib.p1, "string", "The value that is given to 'enhanceSettings' is saved on the instance");
		assert.deepEqual(oLib.p2, ["element1", "element2"], "The value that is given to 'enhanceSettings' is saved on the instance");
		assert.deepEqual(oLib.types, ["my.library.types.Type1", "my.library.types.Type2"], "The value that is given to 'enhanceSettings' is saved on the instance");

		oLib.enhanceSettings({
			p2: ["element3"]
		});

		assert.strictEqual(oLib.isSettingsEnhanced(), true, "'isSettingsEnhanced' should return true after calling 'enhanceSettings'");
		assert.deepEqual(oLib.p2, ["element1", "element2"], "Calling 'enhanceSettings' the second time doesn't have any effect");
	});

	/*
	 *   lib1 (js)
	 *     -> lib3 (js), lib4 (js, json), lib5 (json)
	 */
	QUnit.test("Instance method 'preload' and 'getManifest'", function(assert) {
		function checkLibNotInitialized(sName) {
			assert.notOk(Library.all()[sName], "The library " + sName + "is only preloaded and should not initialize itself");
		}

		this.spy(sap.ui.loader._, 'loadJSResourceAsync');
		this.spy(sap.ui, 'require');

		// make lib3 already loaded
		sap.ui.predefine('testlibs/scenario1/lib3/library', ["sap/ui/core/Lib"], function(Library) {
			return Library.init({
				name: 'testlibs.scenario1.lib3',
				apiVersion: 2,
				noLibraryCSS: true
			});
		});

		var oLib1 = Library._get('testlibs.scenario1.lib1', true);
		assert.strictEqual(oLib1.getManifest(), undefined, "Manifest of lib1 doesn't exist before it's preloaded");
		var vResult = oLib1.preload();

		assert.ok(vResult instanceof Promise, "async call to 'preload' should return a promise");

		return vResult.then(function(vResult) {
			assert.ok(oLib1.getManifest(), "Manifest exists after the library is preloaded");

			checkLibNotInitialized('testlibs.scenario1.lib1');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib1\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib1/library']);

			// lib3 should not be preloaded as its library.js has been (pre)loaded before
			checkLibNotInitialized('testlibs.scenario1.lib3');
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib3\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib3/library']);

			// lib4 and lib5 should have been preloaded
			checkLibNotInitialized('testlibs.scenario1.lib4');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib4\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib4/library']);

			// lib5 should load the json format as fallback
			checkLibNotInitialized('testlibs.scenario1.lib5');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib5\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib5/library']);
		});
	});

	QUnit.test("Instance method 'loadResourceBundle' and 'getResourceBundle'", function(assert) {
		var oLib1 = Library._get('testlibs.scenario1.lib1', true);

		this.spy(ResourceBundle, "create");

		return oLib1.loadResourceBundle().then(function(oResourceBundle) {
			assert.equal(ResourceBundle.create.callCount, 0, "ResourceBundle.create is not called");

			var oResourceBundle1 = oLib1.getResourceBundle();

			assert.strictEqual(oResourceBundle1, oResourceBundle, "'getResourceBundle' should return the cached resource bundle");
			assert.equal(ResourceBundle.create.callCount, 0, "ResourceBundle.create is not called");
		});
	});

	QUnit.test("Instance method '_getI18nSettings': i18n missing in manifest.json", function(assert) {
		const oLib1 = Library._get('testlibs.scenario1.lib1', true);
		// no i18n property in manifest
		this.stub(oLib1, 'getManifest').returns({
			"_version": "2.0.0",
			"name": "sap.test.i18ntrue",
			"sap.ui5": {
			}
		});

		// act
		const i18nSettings = oLib1._getI18nSettings();

		// assert
		assert.deepEqual(
			i18nSettings,
			{
				bundleUrl: "messagebundle.properties"
			}, "a missing i18n section in the manifest should result in the default bundle URL to be returned");
	});

	QUnit.test("Instance method '_getI18nSettings': i18n set to false in manifest.json", function(assert) {
		const oLib1 = Library._get('testlibs.scenario1.lib1', true);

		this.stub(oLib1, 'getManifest').returns({
			"_version": "2.0.0",
			"name": "sap.test1",
			"sap.ui5": {
				"library": {
					"i18n": false
				}
			}
		});

		// act
		const i18nSettings = oLib1._getI18nSettings();

		// assert
		assert.notOk(i18nSettings, "a value of false for the i18n section should result in no bundle to be loaded");
	});

	QUnit.test("Instance method '_getI18nSettings': i18n set to true in manifest.json", function(assert) {
		const oLib1 = Library._get('testlibs.scenario1.lib1', true);
		this.stub(oLib1, 'getManifest').returns({
			"_version": "2.0.0",
			"name": "sap.test.i18ntrue",
			"sap.ui5": {
				"library": {
					"i18n": true
				}
			}
		});

		// act
		const i18nSettings = oLib1._getI18nSettings();

		// assert
		assert.deepEqual(
			i18nSettings,
			{
				bundleUrl: "messagebundle.properties"
			}, "a value of true for the i18n section should result in the default bundle URL to be returned");
	});

	QUnit.test("Instance method '_getI18nSettings': i18n seto to a string in manifest.json", function(assert) {
		const oLib1 = Library._get('testlibs.scenario1.lib1', true);
		// no i18n property in manifest
		this.stub(oLib1, 'getManifest').returns({
			"_version": "2.0.0",
			"name": "sap.test.i18nstring",
			"sap.ui5": {
				"library": {
					"i18n": "i18n.properties"
				}
			}
		});

		// act
		const i18nSettings = oLib1._getI18nSettings();

		// assert
		assert.deepEqual(
			i18nSettings,
			{
				bundleUrl: "i18n.properties"
			}, "a string value for the i18n section should result in that string to be returned as bundle URL");
	});

	QUnit.test("Instance method '_getI18nSettings': i18n set to an object in manifest.json", function(assert) {
		const oLib1 = Library._get('testlibs.scenario1.lib1', true);
		// no i18n property in manifest
		this.stub(oLib1, 'getManifest').returns({
			"_version": "2.0.0",
			"name": "sap.test.i18nobject",
			"sap.ui5": {
				"library": {
					"i18n": {
						"bundleUrl": "i18n.properties",
						"supportedLocales": [
							"en",
							"de"
						]
					}
				}
			}
		});

		// act
		const i18nSettings = oLib1._getI18nSettings();

		// assert
		assert.deepEqual(
			i18nSettings,
			{
				bundleUrl: "i18n.properties",
				supportedLocales: [
					"en",
					"de"
				]
			}, "an object as i18n section should be returned 1:1");
	});

	QUnit.module("Static methods");

	QUnit.test("Static method '_get'", function(assert) {
		var oLib = Library._get("my.test.library");
		assert.notOk(oLib, "Library instance should not be created without giving the second parameter");

		oLib = Library._get("my.test.library", true);
		assert.ok(oLib instanceof Library, "Library instance is created");

		var oLibCopy = Library._get("my.test.library");
		assert.strictEqual(oLibCopy, oLib, "Multiple call to Library.get should return the same instance");
		assert.notOk(oLib.isSettingsEnhanced(), "Lib's settings aren't enhanced yet");

		assert.deepEqual(oLib.dependencies, [], "default value should be provided for 'dependencies'");
		assert.deepEqual(oLib.types, [], "default value should be provided for 'types'");
		assert.deepEqual(oLib.interfaces, [], "default value should be provided for 'interfaces'");
		assert.deepEqual(oLib.controls, [], "default value should be provided for 'controls'");
		assert.deepEqual(oLib.elements, [], "default value should be provided for 'elements'");
	});

	QUnit.test("Static method 'load', 'init', 'all'", function(assert) {
		function checkLibInitialized(sName) {
			assert.ok(Library.all()[sName], "The library " + sName + " is initialized");
		}

		this.spy(Library.prototype, '_preload');
		this.spy(sap.ui, 'require');

		// make lib3 already loaded
		sap.ui.predefine('testlibs/scenario2/lib3/library', ["sap/ui/core/Lib"], function(Library) {
			return Library.init({
				name: 'testlibs.scenario2.lib3',
				apiVersion: 2,
				noLibraryCSS: true
			});
		});

		var vResult = Library.load({
			name: 'testlibs.scenario2.lib1'
		});

		assert.ok(vResult instanceof Promise, "async call to 'preload' should return a promise");

		return vResult.then(function(oLib1) {
			checkLibInitialized('testlibs.scenario2.lib1');
			sinon.assert.calledOn(Library.prototype._preload, oLib1, "Library.prototype.preload is called");
			sinon.assert.calledWith(sap.ui.require, ['testlibs/scenario2/lib1/library']);

			// lib3 should not be preloaded as its library.js has been (pre)loaded before
			checkLibInitialized('testlibs.scenario2.lib3');
			var oLib3 = Library._get('testlibs.scenario2.lib3');
			assert.ok(oLib3, "Library instance is created");
			sinon.assert.calledOn(Library.prototype._preload, oLib3, "Library.prototype.preload is called");

			// lib4 and lib5 should have been preloaded
			checkLibInitialized('testlibs.scenario2.lib4');
			var oLib4 = Library._get('testlibs.scenario2.lib4');
			sinon.assert.calledOn(Library.prototype._preload, oLib4, "Library.prototype.preload is called");

			// lib5 should load the json format as fallback
			checkLibInitialized('testlibs.scenario2.lib5');
			var oLib5 = Library._get('testlibs.scenario2.lib5');
			sinon.assert.calledOn(Library.prototype._preload, oLib5, "Library.prototype.preload is called");
		});
	});

	QUnit.test("Static private method '_registerElement'", function(assert) {
		var sLibName = "test.lib.qunit";
		var oElementMetadata = {
			getName: function() {
				return sLibName + ".DummyElement";
			},
			getLibraryName: function() {
				return sLibName;
			},
			isA: function() {
				return true;
			},
			getStereotype: function() {
				return "control";
			}
		};

		assert.equal(Object.keys(Library.all()).includes(sLibName), false, "The library " + sLibName + " isn't listed in Library.all()");
		assert.equal(Object.keys(Library._all(true)).includes(sLibName), false, "The library " + sLibName + " isn't listed in Library._all(true) (without considering settings enhancement)");

		Library._registerElement(oElementMetadata);

		assert.equal(Object.keys(Library.all()).includes(sLibName), false, "The library " + sLibName + " is still not listed in Library.all()");
		assert.equal(Object.keys(Library._all(true)).includes(sLibName), true, "The library " + sLibName + " is now listed in Library._all(true) (without considering settings enhancement)");
	});

	QUnit.test("Static method 'getResourceBundleFor' called on library where manifest.json exists", function(assert) {
		var sLibraryName = "testlibs.resourcebundle.lib1";
		var oResourceBundle = Library.getResourceBundleFor(sLibraryName);

		assert.ok(oResourceBundle, "Resource bundle can be created successfully");
		assert.equal(oResourceBundle.getText("TITLE1"), "i18n.properties", "The configured resource bundle file in manifest.json is loaded (i18n.properties)");
	});

	QUnit.module("Library.js included in custom bundle");

	/**
	 * testlibs/customBundle contains one custom bundle (custom-bundle.js) which preloads:
	 *   - testlibs/customBundle/lib1/library.js
	 *   - testlibs/customBundle/lib1/manifest.json
	 *   - testlibs/customBundle/lib4/library.js
	 *   - testlibs/customBundle/lib4/manifest.json
	 *
	 * There are two libraries testlibs/customBundle/lib1 and testlibs/customBundle/lib2 which have dependency of each
	 * other. A cycle also exists for 'lib1' and 'lib4'.
	 *
	 * testlibs/customBundle/lib2 contains a dependency to testlibs/customBundle/lib3
	 */
	QUnit.test("Two libraries which have dependency of each other", function (assert) {
		var oLoadResourceBundleSpy = this.spy(Library.prototype, "loadResourceBundle");
		var oResourceBundleCreateSpy = this.spy(ResourceBundle, "create");
		var oLoadLibraryPreload = this.spy(Library.prototype, "_loadLibraryPreload");

		return includeScript({
			url: sap.ui.require.toUrl("testlibs/customBundle/custom-bundle.js")
		}).then(function() {
			return Library.load("testlibs.customBundle.lib1");
		}).then(function() {
			// library-preload of lib1 is already available with the custom-bundle
			assert.equal(oLoadLibraryPreload.callCount, 2, "Library.prototype._loadLibraryPreload should be called only twice (lib2, lib3)");
			assert.ok(oLoadLibraryPreload.calledOn(oLoadLibraryPreload.getCall(0).thisValue), "library-preload of testlibs/customBundle/lib2 is loaded asynchronously");
			assert.notOk(oLoadLibraryPreload.getCall(0).args[0], "library-preload of lib2 should be loaded");

			assert.ok(oLoadLibraryPreload.calledOn(oLoadLibraryPreload.getCall(1).thisValue), "library-preload of testlibs/customBundle/lib3 is loaded asynchronously");
			assert.notOk(oLoadLibraryPreload.getCall(1).args[0], "library-preload of lib3 should be loaded");

			assert.equal(oLoadResourceBundleSpy.callCount, 4, "Lib#loadResourceBundle should be called four times");

			assert.equal(oResourceBundleCreateSpy.callCount, 4, "ResourceBundle.create should be called only four times");
			assert.ok(oResourceBundleCreateSpy.getCall(0).args[0], "bundle should be loaded");
			assert.ok(oResourceBundleCreateSpy.getCall(1).args[0], "bundle should be loaded");
			assert.ok(oResourceBundleCreateSpy.getCall(2).args[0], "bundle should be loaded");
			assert.ok(oResourceBundleCreateSpy.getCall(3).args[0], "bundle should be loaded");
		});
	});

	QUnit.module("Register Element");

	QUnit.test("Register element at an existing library", function(assert) {
		return new Promise(function(resolve, reject) {
			sap.ui.require(["sap/ui/core/Control"], function(Control){
				Control.extend("sap.ui.core.TestControlInLibUnitTest", {
					metadata: {
						properties: {
							width: {
								type: "sap.ui.core.CSSSize",
								group: "Dimension",
								defaultValue: null
							},
							height: {
								type: "sap.ui.core.CSSSize",
								group: "Dimension",
								defaultValue: null
							}
						}
					},
					renderer: function(oRm, oControl) {
					}
				});

				assert.ok(Library._get("sap.ui.core").controls.includes("sap.ui.core.TestControlInLibUnitTest"), "The new control is registered in the library");
				resolve();
			}, reject);
		});
	});

	QUnit.test("Create element under non-existing namespace should trigger the creation of the library implicitly", function(assert) {
		assert.notOk(Object.keys(Library.all()).includes("dummy.library"), "The library doesn't exist");

		return new Promise(function(resolve, reject) {
			sap.ui.require(["sap/ui/core/Control"], function(Control){
				Control.extend("dummy.library.TestControlInLibUnitTest", {
					metadata: {
						properties: {
							width: {
								type: "sap.ui.core.CSSSize",
								group: "Dimension",
								defaultValue: null
							},
							height: {
								type: "sap.ui.core.CSSSize",
								group: "Dimension",
								defaultValue: null
							}
						}
					},
					renderer: function(oRm, oControl) {
					}
				});

				assert.notOk(Object.keys(Library.all()).includes("dummy.library"), "The library is created implicitly. But it's not listed in Library.all()");
				assert.ok(Object.keys(Library._all(true)).includes("dummy.library"), "The library is created implicitly. And it's listed in Library._all(true) where the settings enhancement status isn't considered");
				assert.ok(Library._get("dummy.library").controls.includes("dummy.library.TestControlInLibUnitTest"), "The new control is registered in the library");
				resolve();
			}, reject);
		});
	});



	QUnit.module("Handling of 'apiVersion: 2'");

	QUnit.test("Unknown apiVersion is rejected", function (assert) {
		assert.throws(() => {
			Library.init({
				name: "bad.apiversion.library",
				// ui5lint-disable-next-line no-deprecated-api
				apiVersion: 3
			});
		}, /The library 'bad\.apiversion\.library' has defined 'apiVersion: 3', which is an unsupported value/);
	});
});
