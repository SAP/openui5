/*global QUnit, sinon, testlibs*/

sap.ui.require([
	'jquery.sap.global',
	'sap/base/util/ObjectPath',
	'sap/base/util/LoaderExtensions',
	'sap/base/i18n/ResourceBundle',
	'sap/base/Log',
	'sap/ui/core/Configuration',
	'sap/ui/core/Lib'
], function(jQuery, ObjectPath, LoaderExtensions, ResourceBundle, Log, Configuration, Library) {
	"use strict";

	QUnit.assert.isLibLoaded = function(libName) {
		this.ok(ObjectPath.get(libName), "namespace for " + libName + " should exist");
		this.ok(sap.ui.getCore().getLoadedLibraries()[libName], "Core should know and list " + libName + " as 'loaded'");
	};

	QUnit.module('getLibraryResourceBundle');

	QUnit.test("sync: testGetLibraryResourceBundle", function(assert) {
		assert.equal(typeof sap.ui.getCore().getLibraryResourceBundle, "function", "Core has method getLibraryResourceBundle");
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core", "de");
		assert.ok(oBundle, "bundle could be retrieved");
		assert.equal(oBundle.getText("SAPUI5_FRIDAY"), "Friday", "bundle can resolve texts");
		assert.equal(oBundle.getText("SAPUI5_GM_ZSTEP"), "Zoom step {0}", "bundle can resolve texts");
	});

	QUnit.test("sync: testGetLibraryResourceBundle with i18n set to false in manifest.json", function(assert) {
		this.stub(sap.ui.loader._, 'getModuleState').returns(true);

		this.stub(LoaderExtensions, 'loadResource').returns({
			"_version": "1.9.0",
			"sap.ui5": {
				"library": {
					"i18n": false
				}
			}
		});

		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test1", "de");

		assert.notOk(oBundle, "No Bundle is returned");
	});

	QUnit.test("testGetLibraryResourceBundle: Called with async first and then with sync before the async is resolved", function(assert) {
		var fnResolve, pBundle, oBundle;

		this.stub(ResourceBundle, 'create').callsFake(function(options) {
			if (options.async) {
				return new Promise(function(resolve, reject) {
					fnResolve = resolve;
				});
			} else {
				return {};
			}
		});

		pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test2", "en", true);

		assert.ok(pBundle instanceof Promise, "a promise should be returned");

		// load resource bundle sync
		oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test2", "en", false);
		assert.ok(oBundle, "a Bundle is returned");
		assert.notOk(oBundle instanceof Promise, "a Bundle object should be returned, not a promise");

		fnResolve({});

		return pBundle;
	});

	QUnit.test("testGetLibraryResourceBundle: Called with sync first and then with async", function(assert) {
		var iCounter = 0,
			pBundle,
			oBundle;

		this.stub(ResourceBundle, 'create').callsFake(function(options) {
			iCounter++;
			if (options.async) {
				assert.ok(false, "no Promise should be returned");
			} else {
				return {};
			}
		});

		oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test3", "en", false);

		assert.ok(oBundle, "a promise should be returned");
		assert.notOk(oBundle instanceof Promise, "a Bundle object should be returned, not a promise");

		assert.equal(iCounter, 1, "ResourceBundle.create is called once");
		pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test3", "en", true);
		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(iCounter, 1, "ResourceBundle.create is still called only once");

		return pBundle;
	});

	// ---------------------------------------------------------------------------
	// loadLibraries
	// ---------------------------------------------------------------------------

	QUnit.module("loadLibraries (from server)", {
		beforeEach: function(assert) {
			assert.notOk(Configuration.getDebug(), "debug mode must be deactivated to properly test library loading");
		},
		afterEach: function(assert) {
			delete window.testlibs;
		}
	});

	/*
	 * Scenario1:
	 *
	 *   lib1 (js)
	 *     -> lib3 (js), lib4 (js, json), lib5 (json)
	 *   lib2 (json)
	 *     -> lib4 (js, json), lib1 (js), lib6 (js, lazy), lib7 (none)
	 */
	QUnit.test("multiple libraries (async, preloads are active)", function(assert) {

		// NOTE:
		// The assertions below that are marked with "TODO (sync initLibrary)" should be fulfilled
		// once the dependency resolution during the 'require' phase of loadLibrary/loadLibraries
		// is done asynchronously, based on the manifest.
		// Currently, it is still done synchronously in initLibrary based on initLibrary data.

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");

		this.spy(sap.ui.loader._, 'loadJSResourceAsync');
		this.spy(sap.ui, 'require');
		this.spy(sap.ui, 'requireSync');

		// make lib3 already loaded
		sap.ui.predefine('testlibs/scenario1/lib3/library', [], function() {
			sap.ui.getCore().initLibrary({
				name: 'testlibs.scenario1.lib3',
				noLibraryCSS: true
			});
			return testlibs.scenario1.lib3;
		});

		var vResult = sap.ui.getCore().loadLibraries(['testlibs.scenario1.lib1', 'testlibs.scenario1.lib2']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function(vResult) {
			assert.isLibLoaded('testlibs.scenario1.lib1');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib1\/library-preload\.js$/));
			assert.isLibLoaded('testlibs.scenario1.lib2');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib2\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs/scenario1/lib1/library');
			sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs/scenario1/lib2/library');
			sinon.assert.calledWith(sap.ui.require, ['testlibs/scenario1/lib1/library', 'testlibs/scenario1/lib2/library']);

			// lib3 should not be preloaded as its library.js has been (pre)loaded before
			assert.isLibLoaded('testlibs.scenario1.lib3');
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib3\/library-preload\.js$/));
			// TODO (sync initLibrary) sinon.assert.neverCalledWith(jQuery.sap.require, 'testlibs.scenario1.lib3.library');
			// TODO (sync initLibrary) sinon.assert.calledWith(sap.ui.require, ['testlibs/scenario1/lib3/library']);

			// lib4 and lib5 should have been preloaded
			assert.isLibLoaded('testlibs.scenario1.lib4');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib4\/library-preload\.js$/));
			// TODO (sync initLibrary) sinon.assert.neverCalledWith(jQuery.sap.require, 'testlibs.scenario1.lib4.library');
			// TODO (sync initLibrary) sinon.assert.calledWith(sap.ui.require, ['testlibs/scenario1/lib4/library']);
			assert.isLibLoaded('testlibs.scenario1.lib5');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib5\/library-preload\.js$/));
			// TODO (sync initLibrary) sinon.assert.neverCalledWith(jQuery.sap.require, 'testlibs.scenario1.lib5.library');
			// TODO (sync initLibrary) sinon.assert.calledWith(sap.ui.require, ['testlibs/scenario1/lib5/library']);

			// lib6 shouldn't have been loaded (only lazy dependency)
			assert.ok(!ObjectPath.get('testlibs.scenario1.lib6'), "lib6 should not have been loaded");
			assert.ok(!sap.ui.getCore().getLoadedLibraries()['testlibs.scenario1.lib6'], "Core should not know or report lib6 as 'loaded'");
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib6\/library-preload\.js$/));
			// TODO (sync initLibrary) sinon.assert.neverCalledWith(jQuery.sap.require, 'testlibs.scenario1.lib6.library');
			// TODO (sync initLibrary) sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib6/library']);

			// lib7 should have been loaded as individual file
			assert.isLibLoaded('testlibs.scenario1.lib7');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib7\/library-preload\.js$/));
			// TODO (sync initLibrary) sinon.assert.neverCalledWith(jQuery.sap.require, 'testlibs.scenario1.lib7.library');
			// TODO (sync initLibrary) sinon.assert.calledWith(sap.ui.require, ['testlibs/scenario1/lib7/library']);

		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));

	});

	/*
	 * Load libraries synchronously
	 *
	 *   lib1 (js)
	 *     -> lib3 (js), lib4 (js, json), lib5 (json)
	 *   lib2 (json)
	 *     -> lib4 (js, json), lib1 (js), lib6 (js, lazy), lib7 (none)
	 */
	QUnit.test("multiple libraries (sync, preloads are active)", function(assert) {

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");

		this.spy(sap.ui, 'requireSync');

		// make lib3 already loaded
		sap.ui.predefine('testlibs/scenario2/lib3/library', [], function() {
			sap.ui.getCore().initLibrary({
				name: 'testlibs.scenario2.lib3',
				noLibraryCSS: true
			});
			return testlibs.scenario2.lib3;
		});

		var vResult = sap.ui.getCore().loadLibraries(['testlibs.scenario2.lib1', 'testlibs.scenario2.lib2'], { async: false });
		assert.ok(vResult == null, "sync call to loadLibraries must not return a value");

		assert.isLibLoaded('testlibs.scenario2.lib1');
		sinon.assert.calledWith(sap.ui.requireSync, sinon.match(/scenario2\/lib1\/library-preload$/));
		assert.isLibLoaded('testlibs.scenario2.lib2');
		sinon.assert.calledWith(sap.ui.requireSync, sinon.match(/scenario2\/lib2\/library-preload$/));

		// lib3 should not be preloaded as its library.js has been (pre)loaded before
		assert.isLibLoaded('testlibs.scenario2.lib3');
		sinon.assert.neverCalledWith(sap.ui.requireSync, sinon.match(/scenario2\/lib3\/library-preload$/));

		// lib4 and lib5 should have been preloaded
		assert.isLibLoaded('testlibs.scenario2.lib4');
		sinon.assert.calledWith(sap.ui.requireSync, sinon.match(/scenario2\/lib4\/library-preload$/));
		assert.isLibLoaded('testlibs.scenario2.lib5');
		sinon.assert.calledWith(sap.ui.requireSync, sinon.match(/scenario2\/lib5\/library-preload$/));

		// lib6 shouldn't have been loaded (only lazy dependency)
		assert.ok(!ObjectPath.get('testlibs.scenario2.lib6'), "lib6 should not have been loaded");
		assert.ok(!sap.ui.getCore().getLoadedLibraries()['testlibs.scenario2.lib6'], "Core should not know or report lib6 as 'loaded'");
		sinon.assert.neverCalledWith(sap.ui.requireSync, sinon.match(/scenario2\/lib6\/library-preload$/));

		assert.isLibLoaded('testlibs.scenario2.lib7');
		sinon.assert.calledWith(sap.ui.requireSync, sinon.match(/scenario2\/lib7\/library-preload$/));

		this.oLibraryGetPreloadStub.restore();
	});

	/*
	 * Scenario3: one missing lib
	 */
	QUnit.test("multiple libraries, one missing (async, preloads are active)", function(assert) {

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");
		var vResult = sap.ui.getCore().loadLibraries(['testlibs.scenario3.lib1', 'testlibs.scenario3.lib2']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.ok(false, "Promise for missing lib should not resolve");
		}, function(e) {
			assert.ok(true, "Promise for missing library should be rejected");
			assert.ok(typeof e === 'object' && /failed to/.test(e.message), "rejected Promise should report an error");
			// TODO check that only lib4 failed
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));
	});

	/*
	 * Scenario4: cycle
	 */
	QUnit.test("two libraries, depending on each other (lib cycle, but not module cycle, async, preloads are active)", function(assert) {

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");
		var vResult = sap.ui.getCore().loadLibraries(['testlibs.scenario4.lib1', 'testlibs.scenario4.lib2']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.isLibLoaded('testlibs.scenario4.lib1');
			assert.isLibLoaded('testlibs.scenario4.lib2');
		}, function(e) {
			assert.ok(false, "Promise for libs with cyclic dependency should not be rejected");
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));
	});

	/*
	 * Scenario: conflicting async and sync calls
	 *
	 *  lib1 -> lib3, lib4, lib5
	 *  lib2 -> lib3, lib6(lazy), lib5
	 *
	 * load async lib1, lib3
	 *      -> lib1 pending (async)
	 *      -> lib3 pending (async)

	 * load sync lib2
	 *      -> load lib2 sync
	 *      -> load lib3 sync (conflict with async load)
	 *      -> load lib5 sync
	 *
	 * load async lib4
	 *      -> lib4 pending (same promise)
	 *
	 * onload lib1
	 *      -> lib3 already loaded
	 *      -> lib4 pending (async)
	 *      -> lib5 already loaded
	 */
	QUnit.test("library with deeper dependency tree + conflicting sync request", function(assert) {

		this.spy(Log, 'warning');

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");
		var vResult = sap.ui.getCore().loadLibraries(['testlibs.scenario5.lib1', 'testlibs.scenario5.lib3']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		sap.ui.getCore().loadLibrary('testlibs.scenario5.lib2');
		assert.isLibLoaded('testlibs.scenario5.lib2');
		assert.isLibLoaded('testlibs.scenario5.lib3');
		assert.isLibLoaded('testlibs.scenario5.lib5');
		assert.ok(!sap.ui.getCore().getLoadedLibraries()['testlibs.scenario5.lib1'], "lib1 should not have been loaded yet");
		assert.ok(!sap.ui.getCore().getLoadedLibraries()['testlibs.scenario5.lib4'], "lib4 should not have been loaded yet");
		sinon.assert.calledWith(Log.warning, sinon.match(/request to load.*while async loading is pending/));

		sap.ui.getCore().loadLibraries(['testlibs.scenario5.lib4']);

		return vResult.then(function() {
			assert.isLibLoaded('testlibs.scenario5.lib1');
			assert.isLibLoaded('testlibs.scenario5.lib4');
		}, function(e) {
			assert.ok(false, "Promise for async loading should be fulfilled even when sync loading conflicts with it");
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));
	});

	/*
	 * Scenario:
	 *
	 *   lib1 (json)
	 *     -> none
	 *   lib2 (json)
	 *     -> none
	 */
	QUnit.test("suppress access to js file by configuration", function(assert) {

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");

		this.spy(sap.ui, 'requireSync');
		sap.ui.getCore().loadLibraries([ { name: 'testlibs.scenario6.lib1', json: true } ], { async: false });
		assert.isLibLoaded('testlibs.scenario6.lib1');
		sinon.assert.neverCalledWith(sap.ui.requireSync, sinon.match(/scenario6\/lib1\/library-preload$/));

		this.spy(sap.ui.loader._, "loadJSResourceAsync");
		return sap.ui.getCore().loadLibraries([ { name: 'testlibs.scenario6.lib2', json: true } ]).then(function() {
			assert.isLibLoaded('testlibs.scenario6.lib2');
			sinon.assert.notCalled(sap.ui.loader._.loadJSResourceAsync);
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));

	});

	QUnit.test("type creation", function (assert) {
		sap.ui.getCore().loadLibrary("testlibs.myGlobalLib");
		// previously the global export of the DataType module was overwritten during
		// the type processing in the library init
		assert.equal(testlibs.myGlobalLib.types.HalfTheTruth.value, 21);
	});

	// ---------------------------------------------------------------------------
	// loadLibraries (mock server)
	// ---------------------------------------------------------------------------

	function makeLib(name) {
		return "" +
			"sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {" +
			"  sap.ui.getCore().initLibrary({" +
			"    name: '" + name + "'," +
			"    noLibraryCSS: true" +
			"  });" +
			"  return " + name + ";" +
			"});";
	}

	function makeManifest(name) {
		var manifest = {
			"sap.ui5": {
				"dependencies" : {
					"libs": {
					}
				}
			}
		};
		return JSON.stringify(manifest);
	}

	function makeLibPreloadJSON(name) {
		var preloadJSON = {
			"version":"2.0",
			"name": name + ".library-preload",
			"modules": {}
		};
		preloadJSON.modules[name.replace(/\./g, "/") + "/library.js"] = makeLib(name);
		preloadJSON.modules[name.replace(/\./g, "/") + "/manifest.json"] = makeManifest(name);
		return JSON.stringify(preloadJSON);
	}

	QUnit.module("loadLibraries", {
		beforeEach: function(assert) {
			assert.notOk(Configuration.getDebug(), "debug mode must be deactivated to properly test library loading");
			this.server = sinon.fakeServer.create();
			this.server.autoRespond = true;
		},
		afterEach: function(assert) {
			this.server.restore();
			delete window.my;
		}
	});

	QUnit.test("multiple libraries (async, preloads are deactivated)", function(assert) {

		this.server.respondWith(/my\/lib3\/library\.js/, makeLib('my.lib3'));
		this.server.respondWith(/my\/lib4\/library\.js/, makeLib('my.lib4'));

		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("off");
		var vResult = sap.ui.getCore().loadLibraries(['my.lib3', 'my.lib4']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.isLibLoaded('my.lib3');
			assert.isLibLoaded('my.lib4');
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));
	});

	QUnit.test("multiple libraries, one missing (async, preloads are activate)", function(assert) {

		this.server.respondWith(/my\/lib5\/library-preload\.json/, makeLibPreloadJSON('my.lib5'));

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");
		var vResult = sap.ui.getCore().loadLibraries(['my.non.existing.lib', 'my.lib5']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.ok(false, "Promise for missing lib should not resolve");
		}, function(e) {
			assert.ok(true, "Promise for missing library should be rejected");
			assert.ok(typeof e === 'object' && /failed to/.test(e.message), "rejected Promise should report an error");
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));
	});

	QUnit.test("multiple libraries, one missing (async, preloads are deactivated)", function(assert) {

		this.server.respondWith(/my\/lib6\/library\.js/, makeLib('my.lib6'));

		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("off");
		var vResult = sap.ui.getCore().loadLibraries(['my.lib6', 'my.non.existing.lib2']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.ok(false, "Promise for missing lib should not resolve");
		}, function(e) {
			assert.ok(true, "Promise for missing library should be rejected");
			assert.ok(typeof e === 'object' && /failed to/.test(e.message), "rejected Promise should report an error");
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));
	});

	QUnit.test("multiple libraries (async, preloads are active, preloadOnly)", function(assert) {

		this.server.respondWith(/my\/lib12\/library-preload\.json/, makeLibPreloadJSON('my.lib12'));
		this.server.respondWith(/my\/lib13\/library-preload\.json/, makeLibPreloadJSON('my.lib13'));

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");
		var vResult = sap.ui.getCore().loadLibraries(['my.lib12', 'my.lib13'], { preloadOnly: true });
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.ok(!ObjectPath.get('my.lib12'), "lib12 should not have been loaded");
			assert.ok(!sap.ui.getCore().getLoadedLibraries()['my.lib12'], "Core should not know or report lib12 as 'loaded'");
			assert.ok(jQuery.sap.isResourceLoaded('my/lib12/library.js'), "lib12 library module should be preloaded");
			assert.ok(!ObjectPath.get('my.lib13'), "lib13 should not have been loaded");
			assert.ok(!sap.ui.getCore().getLoadedLibraries()['my.lib13'], "Core should not know or report lib13 as 'loaded'");
			assert.ok(jQuery.sap.isResourceLoaded('my/lib13/library.js'), "lib13 library module should be preloaded");
		}).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));
	});

	QUnit.test("multiple libraries (sync, existing, preload on)", function(assert) {

		this.server.respondWith(/my\/lib7\/library-preload\.json/, makeLibPreloadJSON('my.lib7'));
		this.server.respondWith(/my\/lib8\/library-preload\.json/, makeLibPreloadJSON('my.lib8'));

		// sync or async both activate the preload
		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");
		var vResult = sap.ui.getCore().loadLibraries(['my.lib7', 'my.lib8'], { async: false });
		assert.ok(vResult == null, "sync call to loadLibraries must not return a value");
		assert.isLibLoaded('my.lib7');
		assert.isLibLoaded('my.lib8');

		this.oLibraryGetPreloadStub.restore();
	});

	QUnit.test("multiple libraries (sync, existing, preload off)", function(assert) {

		this.server.respondWith(/my\/lib9\/library\.js/, makeLib('my.lib9'));
		this.server.respondWith(/my\/lib10\/library\.js/, makeLib('my.lib10'));

		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("off");
		var vResult = sap.ui.getCore().loadLibraries(['my.lib9', 'my.lib10'], { async: false });
		assert.ok(vResult == null, "sync call to loadLibraries must not return a value");
		assert.isLibLoaded('my.lib9');
		assert.isLibLoaded('my.lib10');

		this.oLibraryGetPreloadStub.restore();
	});

	QUnit.test("multiple libraries, one missing (sync, non-existing)", function(assert) {

		this.server.respondWith(/my\/lib11\/library\.js/, makeLib('my.lib11'));

		this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("off");
		try {
			sap.ui.getCore().loadLibraries(['my.non.existing.lib3', 'my.lib11'], { async: false });
			assert.ok(false, "sync loadLibraries for missing lib must not succeed");
		} catch (e) {
			assert.ok(true, "sync loadLibraries should throw an exception");
			assert.ok(typeof e === 'object' && /failed to/.test(e.message), "exception should report an error");
		}

		this.oLibraryGetPreloadStub.restore();
	});

	// ---------------------------------------------------------------------------
	// loadLibrary
	// ---------------------------------------------------------------------------

	QUnit.module("loadLibrary", {
		beforeEach: function(assert) {
			assert.notOk(Configuration.getDebug(), "debug mode must be deactivated to properly test library loading");
		},
		afterEach: function(assert) {
			delete window.testlibs;
		}
	});

	/*
	 * Scenario13:
	 *
	 *   lib1 (js)
	 *     -> lib3 (js), lib4 (js, json), lib5 (json)
	 *   lib2 (json)
	 *     -> lib4 (js, json), lib1 (js), lib6 (js, lazy), lib7 (none)
	 */
	QUnit.test("multiple libraries (async, preloads are active) with transitive dependency closure", function(assert) {

		return LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("testlibs/scenario13/sap-ui-version.json"),
			async: true
		}).then(function(versioninfo) {
			sap.ui.versioninfo = versioninfo;

			// sync or async both activate the preload
			this.oLibraryGetPreloadStub = sinon.stub(Library, "getPreloadMode").returns("sync");

			this.spy(sap.ui.loader._, 'loadJSResourceAsync');
			this.spy(sap.ui, 'require');
			this.spy(sap.ui, 'requireSync');

			// make lib3 already loaded
			sap.ui.predefine('testlibs/scenario13/lib3/library', [], function() {
				sap.ui.getCore().initLibrary({
					name: 'testlibs.scenario13.lib3',
					noLibraryCSS: true
				});
				return testlibs.scenario13.lib3;
			});

			var vResult = sap.ui.getCore().loadLibraries(['testlibs.scenario13.lib2']);
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib1\/library-preload\.js$/));
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib2\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib3\/library-preload\.js$/));
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib4\/library-preload\.js$/));
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib5\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib6\/library-preload\.js$/));
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib7\/library-preload\.js$/));

			assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

			return vResult.then(function(vResult) {
				assert.isLibLoaded('testlibs.scenario13.lib1');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib1\/library-preload\.js$/));
				assert.isLibLoaded('testlibs.scenario13.lib2');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib2\/library-preload\.js$/));
				sinon.assert.neverCalledWith(sap.ui.requireSync, 'testlibs/scenario13/lib2/library');

				// all libs in lib2's transitive dependency closure have been required
				sinon.assert.calledWith(sap.ui.require, ["testlibs/scenario13/lib2/library", "testlibs/scenario13/lib4/library", "testlibs/scenario13/lib1/library", "testlibs/scenario13/lib3/library", "testlibs/scenario13/lib5/library", "testlibs/scenario13/lib7/library"]);

				// lib3 should not be preloaded as its library.js has been (pre)loaded before
				assert.isLibLoaded('testlibs.scenario13.lib3');
				sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib3\/library-preload\.js$/));

				// lib4 and lib5 should have been preloaded
				assert.isLibLoaded('testlibs.scenario13.lib4');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib4\/library-preload\.js$/));

				assert.isLibLoaded('testlibs.scenario13.lib5');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib5\/library-preload\.js$/));

				// lib6 shouldn't have been loaded (only lazy dependency)
				assert.ok(!ObjectPath.get('testlibs.scenario13.lib6'), "lib6 should not have been loaded");
				assert.ok(!sap.ui.getCore().getLoadedLibraries()['testlibs.scenario13.lib6'], "Core should not know or report lib6 as 'loaded'");
				sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib6\/library-preload\.js$/));

				// lib7 should have been loaded as individual file
				assert.isLibLoaded('testlibs.scenario13.lib7');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib7\/library-preload\.js$/));

			});
		}.bind(this)).finally(function () {
			this.oLibraryGetPreloadStub.restore();
		}.bind(this));
	});

});
