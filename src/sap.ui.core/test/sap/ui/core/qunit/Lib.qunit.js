/*global QUnit sinon*/
sap.ui.require([
	"sap/ui/core/Lib",
	"sap/base/util/ObjectPath",
	"sap/ui/core/theming/ThemeManager",
	"sap/base/i18n/ResourceBundle"
], function(Library, ObjectPath, ThemeManager, ResourceBundle) {
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
			assert.notOk(ObjectPath.get(sName), "namespace for " + sName + " should not exist");
			assert.notOk(Library.all()[sName], "The library " + sName + "is only preloaded and should not initialize itself");
		}

		this.spy(sap.ui.loader._, 'loadJSResourceAsync');
		this.spy(XMLHttpRequest.prototype, 'open');
		this.spy(sap.ui, 'require');
		this.spy(sap.ui, 'requireSync');

		// make lib3 already loaded
		sap.ui.predefine('testlibs/scenario1/lib3/library', ["sap/ui/core/Lib"], function(Library) {
			return Library.init({
				name: 'testlibs.scenario1.lib3',
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
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs/scenario1/lib1/library');
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib1/library']);

			// lib3 should not be preloaded as its library.js has been (pre)loaded before
			checkLibNotInitialized('testlibs.scenario1.lib3');
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib3\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs.scenario1.lib3.library');
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib3/library']);

			// lib4 and lib5 should have been preloaded
			checkLibNotInitialized('testlibs.scenario1.lib4');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib4\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs.scenario1.lib4.library');
			sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib4/library']);

			// lib5 should load the json format as fallback
			checkLibNotInitialized('testlibs.scenario1.lib5');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib5\/library-preload\.js$/));
			sinon.assert.calledWith(XMLHttpRequest.prototype.open, "GET", sinon.match(/scenario1\/lib5\/library-preload\.json$/));
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

	QUnit.module("Static methods");

	QUnit.test("Static method 'get' and '_get'", function(assert) {
		var oLib = Library.get("my.test.library");
		assert.notOk(oLib, "Library instance should not be created without giving the second parameter");

		oLib = Library._get("my.test.library", true);
		assert.ok(oLib instanceof Library, "Library instance is created");

		var oLibCopy = Library.get("my.test.library");
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
			assert.ok(ObjectPath.get(sName), "namespace for " + sName + " should exist");
			assert.ok(Library.all()[sName], "The library " + sName + "is initialized");
		}

		this.spy(Library.prototype, '_preload');
		this.spy(sap.ui, 'require');
		this.spy(sap.ui, 'requireSync');

		// make lib3 already loaded
		sap.ui.predefine('testlibs/scenario1/lib3/library', ["sap/ui/core/Lib"], function(Library) {
			return Library.init({
				name: 'testlibs.scenario1.lib3',
				noLibraryCSS: true
			});
		});

		var vResult = Library.load({
			name: 'testlibs.scenario1.lib1'
		});

		assert.ok(vResult instanceof Promise, "async call to 'preload' should return a promise");

		return vResult.then(function(oLib1) {
			checkLibInitialized('testlibs.scenario1.lib1');
			sinon.assert.calledOn(Library.prototype._preload, oLib1, "Library.prototype.preload is called");
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs/scenario1/lib1/library');
			sinon.assert.calledWith(sap.ui.require, ['testlibs/scenario1/lib1/library']);

			// lib3 should not be preloaded as its library.js has been (pre)loaded before
			checkLibInitialized('testlibs.scenario1.lib3');
			var oLib3 = Library.get('testlibs.scenario1.lib3');
			assert.ok(oLib3, "Library instance is created");
			sinon.assert.calledOn(Library.prototype._preload, oLib3, "Library.prototype.preload is called");

			// lib4 and lib5 should have been preloaded
			checkLibInitialized('testlibs.scenario1.lib4');
			var oLib4 = Library.get('testlibs.scenario1.lib4');
			sinon.assert.calledOn(Library.prototype._preload, oLib4, "Library.prototype.preload is called");

			// lib5 should load the json format as fallback
			checkLibInitialized('testlibs.scenario1.lib5');
			var oLib5 = Library.get('testlibs.scenario1.lib5');
			sinon.assert.calledOn(Library.prototype._preload, oLib5, "Library.prototype.preload is called");
		});
	});
});