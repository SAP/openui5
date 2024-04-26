/*global QUnit sinon*/
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/ResourceBundle",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/ObjectPath",
	"sap/ui/base/DataType",
	"sap/ui/core/Lib",
	"sap/ui/core/theming/ThemeManager",
	"sap/ui/dom/includeScript"
], function(Log, ResourceBundle, LoaderExtensions, ObjectPath, DataType, Library, ThemeManager, includeScript) {
	"use strict";

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
			/**
			 * @deprecated
			 */
			assert.notOk(ObjectPath.get(sName), "namespace for " + sName + " should not exist");
			assert.notOk(Library.all()[sName], "The library " + sName + "is only preloaded and should not initialize itself");
		}

		this.spy(sap.ui.loader._, 'loadJSResourceAsync');
		/**
		 * @deprecated As of version 1.120
		 */
		this.spy(XMLHttpRequest.prototype, 'open');
		this.spy(sap.ui, 'require');
		/**
		 * @deprecated As of version 1.120
		 */
		this.spy(sap.ui, 'requireSync');

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
			/**
			 * @deprecated As of version 1.120
			 */
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs/scenario1/lib1/library');
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib1/library']);

			// lib3 should not be preloaded as its library.js has been (pre)loaded before
			checkLibNotInitialized('testlibs.scenario1.lib3');
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib3\/library-preload\.js$/));
			/**
			 * @deprecated As of version 1.120
			 */
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs.scenario1.lib3.library');
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib3/library']);

			// lib4 and lib5 should have been preloaded
			checkLibNotInitialized('testlibs.scenario1.lib4');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib4\/library-preload\.js$/));
			/**
			 * @deprecated As of version 1.120
			 */
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs.scenario1.lib4.library');
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib4/library']);

			// lib5 should load the json format as fallback
			checkLibNotInitialized('testlibs.scenario1.lib5');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib5\/library-preload\.js$/));
			/**
			 * @deprecated As of version 1.120
			 */
			sinon.assert.calledWith(XMLHttpRequest.prototype.open, "GET", sinon.match(/scenario1\/lib5\/library-preload\.json$/));
			/**
			 * @deprecated As of version 1.120
			 */
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs.scenario1.lib5.library');
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib5/library']);
		});
	});

	QUnit.test("Instance method 'includeTheme'", function(assert) {
		var done = assert.async();
		var oLib1 = Library._get('testlibs.scenario1.lib1', true);

		this.spy(ThemeManager, "includeLibraryTheme");
		var aLibsRequiringCss = Library.getAllInstancesRequiringCss();
		var iLength = aLibsRequiringCss.length;

		oLib1._includeTheme();

		aLibsRequiringCss = Library.getAllInstancesRequiringCss();
		assert.equal(aLibsRequiringCss.length - iLength, 1, "One lib more is requiring CSS");
		assert.equal(aLibsRequiringCss[iLength].name, "testlibs.scenario1.lib1");

		setTimeout(function() {
			sinon.assert.calledOnce(ThemeManager.includeLibraryTheme);
			done();
		}, 0);
	});

	QUnit.test("Instance method 'loadResourceBundle' and 'getResourceBundle'", function(assert) {
		var oLib1 = Library._get('testlibs.scenario1.lib1', true);

		this.spy(ResourceBundle, "create");

		return oLib1.loadResourceBundle().then(function(oResourceBundle) {
			assert.ok(ResourceBundle.create.calledOnce, "ResourceBundle.create is called");
			var oCall = ResourceBundle.create.getCall(0);
			assert.ok(oCall.args[0].bundleUrl.match(/scenario1\/lib1\/messagebundle\.properties$/), "bundle settings are correct");
			assert.ok(oCall.args[0].async, "bundle should be loaded async");

			var oResourceBundle1 = oLib1.getResourceBundle();

			assert.strictEqual(oResourceBundle1, oResourceBundle, "'getResourceBundle' should return the cached resource bundle");
			assert.ok(ResourceBundle.create.calledOnce, "ResourceBundle.create isn't called again");
		});
	});

	QUnit.test("Instance method '_getI18nSettings': i18n missing in manifest.json", function(assert) {
		const oLib1 = Library._get('testlibs.scenario1.lib1', true);
		// no i18n property in manifest
		this.stub(oLib1, 'getManifest').returns({
			"_version": "1.9.0",
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
			"_version": "1.9.0",
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
			"_version": "1.9.0",
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
			"_version": "1.9.0",
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
			"_version": "1.9.0",
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
			/**
			 * @deprecated
			 */
			assert.ok(ObjectPath.get(sName), "namespace for " + sName + " should exist");
			assert.ok(Library.all()[sName], "The library " + sName + " is initialized");
		}

		this.spy(Library.prototype, '_preload');
		this.spy(sap.ui, 'require');
		/**
		 * @deprecated As of version 1.120
		 */
		this.spy(sap.ui, 'requireSync');

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
			/**
			 * @deprecated As of version 1.120
			 */
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs/scenario2/lib1/library');
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

	QUnit.test("Static method 'getResourceBundleFor' called on known library where manifest.json does NOT exist", function(assert) {
		var sLibraryName = "testlibs.resourcebundle.lib2";

		return Library.load({name: sLibraryName}).then(function(oLibrary) {
			var oErrorLogSpy = this.spy(Log, "error");
			var oResourceBundle = Library.getResourceBundleFor(sLibraryName);

			assert.ok(oResourceBundle, "Resource bundle can be created successfully");
			assert.equal(oResourceBundle.getText("TITLE1"), "messagebundle.properties", "The fallback file 'messagebundle.properties' is loaded because no manifest.json is available for the library");
			assert.equal(oErrorLogSpy.callCount, 0, "The failed request isn't logged");

			var oLoadResourceSpy = this.spy(LoaderExtensions, "loadResource");

			// try to get the resource bundle again
			oResourceBundle = Library.getResourceBundleFor(sLibraryName);
			assert.equal(oLoadResourceSpy.callCount, 0, "no further call is done for loading the manifest.json after the previous request failed");
			assert.equal(oErrorLogSpy.callCount, 0, "No new error is logged");
		}.bind(this));

	});

	QUnit.test("Static method 'getResourceBundleFor' called on unknown library where manifest.json does NOT exist", function(assert) {
		var sLibraryName = "testlibs.resourcebundle.unknownLib";

		var oErrorLogSpy = this.spy(Log, "error");
		var oResourceBundle = Library.getResourceBundleFor(sLibraryName);

		assert.ok(oResourceBundle, "Resource bundle can be created successfully");

		assert.equal(oErrorLogSpy.callCount, 1, "Error is logged");
		var oExpectedErr = sinon.match.instanceOf(Error).and(sinon.match.has('message', sinon.match(/unknownLib\/manifest.json(?:.)+not(?:.)*loaded/)));
		sinon.assert.calledWith(oErrorLogSpy.getCall(0), oExpectedErr);

		oErrorLogSpy.reset();

		var oLoadResourceSpy = this.spy(LoaderExtensions, "loadResource");

		// try to get the resource bundle again
		oResourceBundle = Library.getResourceBundleFor(sLibraryName);
		assert.equal(oLoadResourceSpy.callCount, 0, "no further call is done for loading the manifest.json after the previous request failed");
		assert.equal(oErrorLogSpy.callCount, 0, "No new error is logged");
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
		var oPreloadJSFormatSpy = this.spy(Library.prototype, "_preloadJSFormat");

		return includeScript({
			url: sap.ui.require.toUrl("testlibs/customBundle/custom-bundle.js")
		}).then(function() {
			return Library.load("testlibs.customBundle.lib1");
		}).then(function() {
			var mLoadedLibraries = Library.all();
			var oLib1 = mLoadedLibraries["testlibs.customBundle.lib1"];
			var oLib2 = mLoadedLibraries["testlibs.customBundle.lib2"];
			var oLib3 = mLoadedLibraries["testlibs.customBundle.lib3"]; // Transitive dependency of lib2
			var oLib4 = mLoadedLibraries["testlibs.customBundle.lib4"];

			// library-preload of lib1 is already available with the custom-bundle
			assert.equal(oPreloadJSFormatSpy.callCount, 2, "Library.prototype._preloadJSFormat should be called only twice (lib2, lib3)");

			assert.ok(oPreloadJSFormatSpy.calledOn(oLib2), "library-preload of testlibs/customBundle/lib2 is loaded asynchronously");
			assert.notOk(oPreloadJSFormatSpy.getCall(0).args[0].sync, "library-preload of lib2 should be loaded async");

			assert.ok(oPreloadJSFormatSpy.calledOn(oLib3), "library-preload of testlibs/customBundle/lib3 is loaded asynchronously");
			assert.notOk(oPreloadJSFormatSpy.getCall(1).args[0].sync, "library-preload of lib3 should be loaded async");

			assert.ok(oLib1, "testlibs.customBundle.lib1 is loaded");
			assert.ok(oLib2, "testlibs.customBundle.lib2 is loaded");
			assert.ok(oLib3, "testlibs.customBundle.lib3 is loaded");
			assert.ok(oLib4, "testlibs.customBundle.lib4 is loaded");

			assert.ok(oLib1.isSettingsEnhanced(), "testlibs.customBundle.lib1 is initialized");
			assert.ok(oLib2.isSettingsEnhanced(), "testlibs.customBundle.lib2 is initialized");
			assert.ok(oLib3.isSettingsEnhanced(), "testlibs.customBundle.lib3 is initialized");
			assert.ok(oLib4.isSettingsEnhanced(), "testlibs.customBundle.lib4 is initialized");

			assert.equal(oLoadResourceBundleSpy.callCount, 4, "Lib#loadResourceBundle should be called four times");
			assert.ok(oLoadResourceBundleSpy.calledOn(oLib1), "ResourceBundle of testlibs/customBundle/lib1 is loaded asynchronously");
			assert.ok(oLoadResourceBundleSpy.calledOn(oLib2), "ResourceBundle of testlibs/customBundle/lib2 is loaded asynchronously");
			assert.ok(oLoadResourceBundleSpy.calledOn(oLib3), "ResourceBundle of testlibs/customBundle/lib3 is loaded asynchronously");
			assert.ok(oLoadResourceBundleSpy.calledOn(oLib4), "ResourceBundle of testlibs/customBundle/lib4 is loaded asynchronously");

			assert.equal(oResourceBundleCreateSpy.callCount, 4, "ResourceBundle.create should be called only four times");
			assert.ok(oResourceBundleCreateSpy.getCall(0).args[0].async, "bundle should be loaded async");
			assert.ok(oResourceBundleCreateSpy.getCall(1).args[0].async, "bundle should be loaded async");
			assert.ok(oResourceBundleCreateSpy.getCall(2).args[0].async, "bundle should be loaded async");
			assert.ok(oResourceBundleCreateSpy.getCall(3).args[0].async, "bundle should be loaded async");

			oResourceBundleCreateSpy.resetHistory();
			assert.equal(oLib1.getResourceBundle().getText("someText"), "I am a lib1 text", "Text from the resource bundle should be correct");
			assert.equal(oLib2.getResourceBundle().getText("someText"), "I am a lib2 text", "Text from the resource bundle should be correct");
			assert.equal(oLib3.getResourceBundle().getText("someText"), "I am a lib3 text", "Text from the resource bundle should be correct");
			assert.equal(oLib4.getResourceBundle().getText("someText"), "I am a lib4 text", "Text from the resource bundle should be correct");
			assert.equal(oResourceBundleCreateSpy.callCount, 0, "getResourceBundle calls shouldn't trigger additional ResourceBundle.create calls");
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

	/**
	 * @deprecated since 1.120
	 */
	QUnit.module("Pseudo Module Deprecation", {
		async before() {
			sap.ui.define("testing/pseudo/modules/deprecation/library", [
				"sap/ui/base/DataType",
				"sap/ui/core/Lib"
			], function(DataType, Library) {
				const oThisLib = Library.init({
					name: 'testing.pseudo.modules.deprecation',
					apiVersion: 2,
					noLibraryCSS: true,
					types: [
						"testing.pseudo.modules.deprecation.SomeEnum",
						"testing.pseudo.modules.deprecation.HexNumber",
						"testing.pseudo.modules.deprecation.SomethingElse"
					]
				});

				oThisLib.SomeEnum = {
					"A": "A",
					"B": "B"
				};
				DataType.registerEnum("testing.pseudo.modules.deprecation.SomeEnum", oThisLib.SomeEnum);

				oThisLib.HexNumber = DataType.createType('testing.pseudo.modules.deprecation.HexNumber', {
						isValid : function(vValue) {
							return /^[0-9A-F]+$/.test(vValue);
						}
					},
					DataType.getType('string')
				);

				oThisLib.SomethingElse = new Date(); // something that is neither a DataType nor a plain object;

				return oThisLib;
			});

			await Library.load({
				name: "testing.pseudo.modules.deprecation"
			});
		},
		beforeEach() {
			this.oLib = sap.ui.require("testing/pseudo/modules/deprecation/library");
			this.spy(Log, "error");
			this.sExpectedEnumErrorMessage =
				"Importing the pseudo module 'testing/pseudo/modules/deprecation/SomeEnum' is deprecated."
				+ " To access the type 'testing.pseudo.modules.deprecation.SomeEnum',"
				+ " please import 'testing/pseudo/modules/deprecation/library'."
				+ " You can then reference this type via the library's module export."
				+ " For more information, see documentation under 'Best Practices for Loading Modules'.";
			this.sExpectedDataTypeErrorMessage =
				"Importing the pseudo module 'testing/pseudo/modules/deprecation/HexNumber' is deprecated."
				+ " To access the type 'testing.pseudo.modules.deprecation.HexNumber',"
				+ " please import 'testing/pseudo/modules/deprecation/library' to ensure that the type is defined."
				+ " You can then access it by calling 'DataType.getType(\"testing.pseudo.modules.deprecation.HexNumber\")'."
				+ " For more information, see documentation under 'Best Practices for Loading Modules'.";
			this.sExpectedOtherErrorMessage =
				"Importing the pseudo module 'testing/pseudo/modules/deprecation/SomethingElse' is deprecated."
				+ " To access the type 'testing.pseudo.modules.deprecation.SomethingElse',"
				+ " please import 'testing/pseudo/modules/deprecation/library'."
				+ " For more information, see documentation under 'Best Practices for Loading Modules'.";
		}
	});

	QUnit.test("Enum with sap.ui.require", function(assert) {
		// Anonymous require: Log does not contain the requesting module
		return new Promise((resolve, reject) => {
			sap.ui.require(["testing/pseudo/modules/deprecation/SomeEnum"], (SomeEnum) => {
				assert.ok(Log.error.calledWith(this.sExpectedEnumErrorMessage), "Error Message for pseudo module deprecation logged.");
				assert.deepEqual(SomeEnum, this.oLib.SomeEnum, "pseudo type module export is correct (A).");
				resolve();
			}, reject);
		});
	});

	QUnit.test("DataType with sap.ui.require", function(assert) {
		// Anonymous require: Log does not contain the requesting module
		return new Promise((resolve, reject) => {
			sap.ui.require(["testing/pseudo/modules/deprecation/HexNumber"], (HexNumber) => {
				assert.ok(Log.error.calledWith(this.sExpectedDataTypeErrorMessage), "Error Message for pseudo module deprecation logged.");
				assert.strictEqual(HexNumber, DataType.getType("testing.pseudo.modules.deprecation.HexNumber"), "pseudo type module export is correct.");
				resolve();
			}, reject);
		});
	});

	QUnit.test("Something else with sap.ui.require", function(assert) {
		// Anonymous require: Log does not contain the requesting module
		return new Promise((resolve, reject) => {
			sap.ui.require(["testing/pseudo/modules/deprecation/SomethingElse"], (SomethingElse) => {
				assert.ok(Log.error.calledWith(this.sExpectedOtherErrorMessage), "Error Message for pseudo module deprecation logged.");
				assert.strictEqual(SomethingElse, this.oLib.SomethingElse, "pseudo type module export is correct.");
				resolve();
			}, reject);
		});
	});

	QUnit.test("Enum with sap.ui.define", function(assert) {
		// sap.ui.define: Log contains the requesting module
		return new Promise((resolve, reject) => {
			const sModuleSpecificErrorMessage = `(dependency of 'my/old/Module1.js') ${this.sExpectedEnumErrorMessage}`;

			sap.ui.define("my/old/Module1", ["testing/pseudo/modules/deprecation/SomeEnum"], (SomeEnum) => {
				assert.ok(Log.error.calledWith(sModuleSpecificErrorMessage), "Error Message for pseudo module deprecation logged.");
				assert.deepEqual(SomeEnum, this.oLib.SomeEnum, "pseudo type module export is correct.");
			});

			sap.ui.require(["my/old/Module1"], function() {
				resolve();
			}, reject);
		});
	});

	QUnit.test("DataType with sap.ui.define", function(assert) {
		// sap.ui.define: Log contains the requesting module
		return new Promise((resolve, reject) => {
			const sModuleSpecificErrorMessage = `(dependency of 'my/old/Module2.js') ${this.sExpectedDataTypeErrorMessage}`;

			sap.ui.define("my/old/Module2", ["testing/pseudo/modules/deprecation/HexNumber"], (HexNumber) => {
				assert.ok(Log.error.calledWith(sModuleSpecificErrorMessage), "Error Message for pseudo module deprecation logged.");
				assert.strictEqual(HexNumber, DataType.getType("testing.pseudo.modules.deprecation.HexNumber"), "pseudo type module export is correct.");
			});

			sap.ui.require(["my/old/Module1"], function() {
				resolve();
			}, reject);
		});
	});

	QUnit.test("Something else with sap.ui.define", function(assert) {
		// sap.ui.define: Log contains the requesting module
		return new Promise((resolve, reject) => {
			const sModuleSpecificErrorMessage = `(dependency of 'my/old/Module3.js') ${this.sExpectedOtherErrorMessage}`;

			sap.ui.define("my/old/Module3", ["testing/pseudo/modules/deprecation/SomethingElse"], (SomethingElse) => {
				assert.ok(Log.error.calledWith(sModuleSpecificErrorMessage), "Error Message for pseudo module deprecation logged.");
				assert.strictEqual(SomethingElse, this.oLib.SomethingElse, "pseudo type module export is correct.");
				resolve();
			});

			sap.ui.require(["my/old/Module1"], function() {
				resolve();
			}, reject);
		});
	});

	QUnit.test("Enum with probing require", function(assert) {
		const SomeEnum = sap.ui.require("testing/pseudo/modules/deprecation/SomeEnum");
		assert.deepEqual(SomeEnum, this.oLib.SomeEnum);
		assert.ok(Log.error.calledWith(this.sExpectedEnumErrorMessage), "Error Message for pseudo module deprecation logged.");
	});

	QUnit.test("DataType with probing require", function(assert) {
		const HexNumber = sap.ui.require("testing/pseudo/modules/deprecation/HexNumber");
		assert.deepEqual(HexNumber, DataType.getType("testing.pseudo.modules.deprecation.HexNumber"));
		assert.ok(Log.error.calledWith(this.sExpectedDataTypeErrorMessage), "Error Message for pseudo module deprecation logged.");
	});

	QUnit.test("Enum with probing require", function(assert) {
		const SomethingElse = sap.ui.require("testing/pseudo/modules/deprecation/SomethingElse");
		assert.deepEqual(SomethingElse, this.oLib.SomethingElse);
		assert.ok(Log.error.calledWith(this.sExpectedOtherErrorMessage), "Error Message for pseudo module deprecation logged.");
	});



	QUnit.module("Handling of 'apiVersion: 2'");

	QUnit.test("Unknown apiVersion is rejected", function (assert) {
		assert.throws(() => {
			Library.init({
				name: "bad.apiversion.library",
				apiVersion: 3
			});
		}, /The library 'bad\.apiversion\.library' has defined 'apiVersion: 3', which is an unsupported value/);
	});
});
