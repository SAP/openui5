/*global QUnit, sinon, testlibs */

QUnit.config.autostart = false;

//Note: this file is embedded via script tag. It therefore uses sap.ui.require, not sap.ui.define.
sap.ui.require([
	'sap/base/i18n/ResourceBundle',
	'sap/base/Log',
	'sap/base/util/LoaderExtensions',
	'sap/ui/Device',
	'sap/ui/core/Element'
], function(ResourceBundle, Log, LoaderExtensions, Device, Element) {
	"use strict";

	function _providesPublicMethods(/**sap.ui.base.Object*/oObject, /** function */ fnClass, /**boolean*/ bFailEarly) {
		var aMethodNames = fnClass.getMetadata().getAllPublicMethods(),
			result = true,
			sMethod;

		for (var i in aMethodNames) {
			sMethod = aMethodNames[i];
			result = result && oObject[sMethod] != undefined;
			if (result){
				continue;
			}
			if (bFailEarly && !result){
				break;
			}
		}
		return result;
	}

	// lazy dependency
	var TestButton;

	// custom assertion
	QUnit.assert.equalControls = function(actual, expected, message) {
		this.ok(actual === expected, message);
	};

	QUnit.assert.isLibLoaded = function(libName) {
		this.ok(jQuery.sap.getObject(libName), "namespace for " + libName + " should exist");
		this.ok(sap.ui.getCore().getLoadedLibraries()[libName], "Core should know and list " + libName + " as 'loaded'");
	};

	// used to get access to the non-public core parts
	var oRealCore;
	var TestCorePlugin = function() {};
	TestCorePlugin.prototype.startPlugin = function(oCore, bOnInit) {
		oRealCore = oCore;
	};
	sap.ui.getCore().registerPlugin(new TestCorePlugin());


	// ---------------------------------------------------------------------------
	// Basic functionality
	// ---------------------------------------------------------------------------

	QUnit.module("Basic");

	QUnit.test("facade", function(assert) {
		this.spy(Log, 'error');

		assert.notStrictEqual(sap.ui.getCore(), oRealCore, "Facade should be different from the implementation");
		assert.notOk(sap.ui.getCore() instanceof oRealCore.constructor, "Facade should not be an instance of sap.ui.core.Core");
		assert.strictEqual(sap.ui.getCore(), sap.ui.getCore(), "consecutive calls to sap.ui.getCore() should return the exact same facade");

		Log.error.reset();
		assert.strictEqual(new oRealCore.constructor(), sap.ui.getCore(), "consecutive calls to the constructor should return the facade");
		sinon.assert.calledWith(Log.error, sinon.match(/Only.*must create an instance of .*Core/).and(sinon.match(/use .*sap.ui.getCore\(\)/)));
	});

	QUnit.test("loadLibrary", function(assert) {
		assert.equal(typeof sap.ui.getCore().loadLibrary, "function", "Core has method loadLibrary");
		assert.ok(sap.ui.loader._.getModuleState("sap/ui/testlib/library.js") === 0, "testlib lib has not been loaded yet");
		assert.ok(!jQuery.sap.getObject("sap.ui.testlib"), "testlib namespace doesn't exists");
		assert.ok(jQuery("head > link[id='sap-ui-theme-sap.ui.testlib']").length === 0, "style sheet doesn't exist");
		sap.ui.getCore().loadLibrary("sap.ui.testlib", "./testdata/uilib");
		assert.ok(sap.ui.loader._.getModuleState("sap/ui/testlib/library.js") !== 0, "testlib lib has been loaded");
		assert.ok(jQuery.sap.getObject("sap.ui.testlib"), "testlib namespace exists");
		assert.ok(jQuery("head > link[id='sap-ui-theme-sap.ui.testlib']").length === 1, "style sheets have been added");

		// load TestButton class
		var done = assert.async();
		sap.ui.require(["sap/ui/testlib/TestButton"], function(_TestButton) {
			TestButton = _TestButton;
			done();
		});
	});

	/**
	 * Tests creation of an UIArea instance and afterwards checks whether it can be found via getUIAreaMethod
	 */
	QUnit.test("testCreateUIArea", function(assert) {
		var oUIArea = sap.ui.getCore().createUIArea("uiArea1");
		assert.ok(!!oUIArea, "UIArea must be created and returned");
		assert.ok(_providesPublicMethods(oUIArea, sap.ui.core.UIArea), "Expected instance of sap.ui.core.UIArea");
		var oUIAreaCheck = sap.ui.getCore().getUIArea("uiArea1");
		assert.ok(!!oUIAreaCheck, "UIArea must be returned");
		assert.ok(_providesPublicMethods(oUIAreaCheck, sap.ui.core.UIArea), "Expected instance of sap.ui.core.UIArea");
		assert.equal(oUIAreaCheck, oUIArea, "Returned UIArea must be the same as the one created before");
	});

	QUnit.test("testSetRoot", function(assert) {
		var oButton = new TestButton("test2Button", {text:"Hallo JSUnit"});
		sap.ui.getCore().setRoot("uiArea2", oButton);
		var oUIAreaCheck = sap.ui.getCore().getUIArea("uiArea2");
		assert.ok(oUIAreaCheck, "UIArea must be returned");
		assert.ok(_providesPublicMethods(oUIAreaCheck, sap.ui.core.UIArea), "Expected instance of sap.ui.core.UIArea");
	});

	QUnit.test("testGetElementById", function(assert) {
		var oButton = new TestButton("test3Button", {text:"Hallo JSUnit"});
		sap.ui.getCore().setRoot("uiArea3", oButton);
		var oButtonCheck = sap.ui.getCore().getElementById("test3Button");
		assert.ok(oButtonCheck, "Button must be returned");
		assert.equalControls(oButtonCheck, oButton, "Returned Button must be the same as the one created before");
	});

	/**
	 * Tests that <code>sap.ui.getCore().notifyContentDensityChanged()</code> calls each control's #onThemeChanged method
	 */
	QUnit.test("test #notifyContentDensityChanged", function(assert) {
		assert.expect(4);

		var oBtn = new TestButton("testMyButton", {text:"Hallo JSUnit"});
		oBtn.onThemeChanged = function(oCtrlEvent) {
			assert.ok(oCtrlEvent, "TestButton#onThemeChanged is called");
			assert.equal(oCtrlEvent.theme, sap.ui.getCore().getConfiguration().getTheme(), "Default theme is passed along control event");
		};

		function handler(oEvent) {
			assert.ok(oEvent, "attachThemeChanged is called");
			assert.equal(oEvent.getParameter("theme"), sap.ui.getCore().getConfiguration().getTheme(), "Default theme is passed along Core event");
		}
		sap.ui.getCore().attachThemeChanged(handler);

		//call to #notifyContentDensityChanged
		sap.ui.getCore().notifyContentDensityChanged();

		// cleanup
		sap.ui.getCore().detachThemeChanged(handler);
		oBtn.destroy();
	});

	QUnit.test("testGetControl", function(assert) {
		var oButton = new TestButton("test4Button", {text:"Hallo JSUnit"});
		sap.ui.getCore().setRoot("uiArea4", oButton);
		var oButtonCheck = sap.ui.getCore().getControl("test4Button");
		assert.ok(oButtonCheck, "Button must be returned");
		assert.equalControls(oButtonCheck, oButton, "Returned Button must be the same as the one created before");
	});

	QUnit.test("testSetThemeRoot", function(assert) {
		sap.ui.getCore().setThemeRoot("my_theme", ["sap.ui.core"], "http://core.something.corp");
		sap.ui.getCore().setThemeRoot("my_theme", "http://custom.something.corp");
		sap.ui.getCore().setThemeRoot("my_theme", ["sap.ui.commons"], "http://commons.something.corp");

		var corePath = oRealCore._getThemePath("sap.ui.core", "my_theme");
		var commonsPath = oRealCore._getThemePath("sap.ui.commons", "my_theme");
		var otherPath = oRealCore._getThemePath("sap.ui.other", "my_theme");

		assert.equal(corePath, "http://core.something.corp/sap/ui/core/themes/my_theme/", "path should be as configured");
		assert.equal(commonsPath, "http://commons.something.corp/sap/ui/commons/themes/my_theme/", "path should be as configured");
		assert.equal(otherPath, "http://custom.something.corp/sap/ui/other/themes/my_theme/", "path should be as configured");

		corePath = jQuery.sap.getModulePath("sap.ui.core.themes.my_theme", "/");
		commonsPath = jQuery.sap.getModulePath("sap.ui.commons.themes.my_theme", "/");
		otherPath = jQuery.sap.getModulePath("sap.ui.other.themes.my_theme", "/");

		assert.equal(corePath, "http://core.something.corp/sap/ui/core/themes/my_theme/", "path should be as configured");
		assert.equal(commonsPath, "http://commons.something.corp/sap/ui/commons/themes/my_theme/", "path should be as configured");
		assert.equal(otherPath, "http://custom.something.corp/sap/ui/other/themes/my_theme/", "path should be as configured");

		corePath = sap.ui.resource("sap.ui.core", "themes/my_theme/img/x.png");
		commonsPath = sap.ui.resource("sap.ui.commons", "themes/my_theme/img/x.png");
		otherPath = sap.ui.resource("sap.ui.other", "themes/my_theme/img/x.png");

		assert.equal(corePath, "http://core.something.corp/sap/ui/core/themes/my_theme/img/x.png", "path should be as configured");
		assert.equal(commonsPath, "http://commons.something.corp/sap/ui/commons/themes/my_theme/img/x.png", "path should be as configured");
		assert.equal(otherPath, "http://custom.something.corp/sap/ui/other/themes/my_theme/img/x.png", "path should be as configured");

		// Set theme root for all libs with forceUpdate
		sap.ui.getCore().setThemeRoot("test_theme", "/foo/", true);

		corePath = oRealCore._getThemePath("sap.ui.core", "test_theme");
		var oCoreLink = document.getElementById("sap-ui-theme-sap.ui.core");

		assert.equal(corePath, "/foo/sap/ui/core/themes/test_theme/", "path should be as configured");
		assert.equal(oCoreLink.getAttribute("href"), "/foo/sap/ui/core/themes/test_theme/library.css", "Stylesheet should have been updated");

		// Set theme root for sap.ui.core lib with forceUpdate
		sap.ui.getCore().setThemeRoot("test_theme", ["sap.ui.core"], "/bar/", true);

		corePath = oRealCore._getThemePath("sap.ui.core", "test_theme");
		oCoreLink = document.getElementById("sap-ui-theme-sap.ui.core");

		assert.equal(corePath, "/bar/sap/ui/core/themes/test_theme/", "path should be as configured");
		assert.equal(oCoreLink.getAttribute("href"), "/bar/sap/ui/core/themes/test_theme/library.css", "Stylesheet should have been updated");

	});

	// now check the location of the preconfigured themes
	QUnit.test("themeRoot configuration", function(assert) {
		var corePath = oRealCore._getThemePath("sap.ui.core", "my_preconfigured_theme");
		var commonsPath = oRealCore._getThemePath("sap.ui.commons", "my_preconfigured_theme");
		var otherPath = oRealCore._getThemePath("sap.ui.other", "my_preconfigured_theme");

		assert.equal(corePath, "http://preconfig.com/ui5-themes/sap/ui/core/themes/my_preconfigured_theme/", "path should be as configured");
		assert.equal(commonsPath, "http://preconfig.com/ui5-themes/sap/ui/commons/themes/my_preconfigured_theme/", "path should be as configured");
		assert.equal(otherPath, "http://preconfig.com/ui5-themes/sap/ui/other/themes/my_preconfigured_theme/", "path should be as configured");

		corePath = oRealCore._getThemePath("sap.ui.core", "my_second_preconfigured_theme");
		commonsPath = oRealCore._getThemePath("sap.ui.commons", "my_second_preconfigured_theme");
		otherPath = oRealCore._getThemePath("sap.ui.other", "my_second_preconfigured_theme");

		assert.equal(corePath, "http://core.preconfig.com/ui5-themes/sap/ui/core/themes/my_second_preconfigured_theme/", "path should be as configured");
		assert.equal(commonsPath, "http://commons.preconfig.com/ui5-themes/sap/ui/commons/themes/my_second_preconfigured_theme/", "path should be as configured");
		assert.equal(otherPath, "http://preconfig.com/ui5-themes/sap/ui/other/themes/my_second_preconfigured_theme/", "path should be as configured");

		// read from script tag
		corePath = oRealCore._getThemePath("sap.ui.core", "my_third_preconfigured_theme");
		assert.equal(corePath, "http://third.preconfig.com/ui5-themes/sap/ui/core/themes/my_third_preconfigured_theme/", "path should be as configured");
	});

	QUnit.test("Browser Version Test", function(assert) {
		assert.expect(4);
		var browser = Device.browser;
		var value = jQuery("html").attr("data-sap-ui-browser");
		assert.ok(typeof value === "string" && value, "Data attribute is set and is not empty");

		var version = browser.version;
		assert.ok(typeof version === "number", "Browser version is set");

		if (browser.firefox) {
			assert.ok(value.indexOf("ff") === 0, "Browser is Firefox and data attribute is set right");
		} else if (browser.webkit) {
			if (browser.chrome) {
				assert.ok(value.indexOf("cr") === 0, "Browser is Chrome and data attribute is set right");
			}
			// Those tests should not be called anymore
			if (browser.safari && browser.mobile) {
				assert.ok(value.indexOf("msf") === 0, "Browser is Mobile Safari and data attribute is set right");
			} else if (browser.safari) {
				assert.ok(value.indexOf("sf") === 0, "Browser is Safari and data attribute is set right");
			}
		} else if (browser.msie) {
			assert.ok(value.indexOf("ie") === 0, "Browser is IE and data attribute is set right");
		} else if (browser.edge) {
			assert.ok(value.indexOf("ed") === 0, "Browser is Edge and data attribute is set right");
		}

		if (!browser.safari || (!browser.fullscreen && !browser.webview)) {
			assert.ok(value.indexOf(Math.floor(version)) != -1, "Version is set right in data attribute");
		} else {
			assert.ok(!/[0-9]+$/.test(value), "unknown browser versions shouldn't be added to the data attribute");
		}

	});

	// now check the locale configuration to be applied as lang attribute
	QUnit.test("Locale configuration", function(assert) {

		var $html = jQuery("html");
		var oConfig = sap.ui.getCore().getConfiguration();
		var oLocale = oConfig.getLocale();
		var sLocale = oLocale && oLocale.toString();

		assert.equal($html.attr("lang"), sLocale, "lang attribute matches locale");

		sLocale = "de";
		oConfig.setLanguage(sLocale);
		assert.equal($html.attr("lang"), sLocale, "lang attribute matches locale");

	});

	QUnit.test("prerendering tasks", function (assert) {
		var bCalled1 = false,
			bCalled2 = false,
			oCore = sap.ui.getCore();

		function task1 () {
			bCalled1 = true;
			assert.ok(!bCalled2, "not yet called");
		}

		function task2 () {
			bCalled2 = true;
		}

		oCore.addPrerenderingTask(task1);
		oCore.addPrerenderingTask(task2);

		assert.ok(!bCalled1, "not yet called");
		assert.ok(!bCalled2, "not yet called");

		oCore.applyChanges();

		assert.ok(bCalled1, "first task called");
		assert.ok(bCalled2, "second task called");
	});

	QUnit.test("prerendering tasks: reverse order", function (assert) {
		var bCalled1 = false,
			bCalled2 = false,
			oCore = sap.ui.getCore();

		function task1 () {
			bCalled1 = true;
			assert.ok(!bCalled2, "not yet called");
		}

		function task2 () {
			bCalled2 = true;
		}

		oCore.addPrerenderingTask(task2);
		oCore.addPrerenderingTask(task1, true);

		assert.ok(!bCalled1, "not yet called");
		assert.ok(!bCalled2, "not yet called");

		oCore.applyChanges();

		assert.ok(bCalled1, "first task called");
		assert.ok(bCalled2, "second task called");
	});


	QUnit.module('getLibraryResourceBundle');

	QUnit.test("sync: testGetLibraryResourceBundle", function(assert) {
		assert.equal(typeof sap.ui.getCore().getLibraryResourceBundle, "function", "Core has method getLibraryResourceBundle");
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core", "de");
		assert.ok(oBundle, "bundle could be retrieved");
		assert.equal(oBundle.getText("SAPUI5_FRIDAY"), "Friday", "bundle can resolve texts");
		assert.equal(oBundle.getText("SAPUI5_GM_ZSTEP"), "Zoom step {0}", "bundle can resolve texts");
	});

	QUnit.test("async: testGetLibraryResourceBundle with already loaded bundle", function(assert) {
		var oSpy = sinon.spy(ResourceBundle, 'create'),
			pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core", "de", true);

		assert.ok(pBundle instanceof Promise, "a promise should be returned");

		return pBundle.then(function(oBundle) {
			assert.ok(oSpy.notCalled, "jQuery.sap.resources is not called");
			assert.ok(oBundle, "bundle could be retrieved");
			assert.equal(oBundle.getText("SAPUI5_FRIDAY"), "Friday", "bundle can resolve texts");
			assert.equal(oBundle.getText("SAPUI5_GM_ZSTEP"), "Zoom step {0}", "bundle can resolve texts");

			oSpy.restore();
		});
	});

	QUnit.test("async: testGetLibraryResourceBundle", function(assert) {
		var oSpy = sinon.spy(ResourceBundle, 'create'),
			pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core", "en", true);

		assert.ok(pBundle instanceof Promise, "a promise should be returned");

		return pBundle.then(function(oBundle) {
			assert.equal(oSpy.callCount, 1, "jQuery.sap.resources is called");
			assert.ok(oBundle, "bundle could be retrieved");
			assert.equal(oBundle.getText("SAPUI5_FRIDAY"), "Friday", "bundle can resolve texts");
			assert.equal(oBundle.getText("SAPUI5_GM_ZSTEP"), "Zoom step {0}", "bundle can resolve texts");

			oSpy.restore();
		});
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

	QUnit.test("async: testGetLibraryResourceBundle with i18n set to false in manifest.json", function(assert) {
		this.stub(sap.ui.loader._, 'getModuleState').returns(true);

		this.stub(LoaderExtensions, 'loadResource').returns({
			"_version": "1.9.0",
			"sap.ui5": {
				"library": {
					"i18n": false
				}
			}
		});

		var pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test1", "de", true);

		assert.ok(pBundle instanceof Promise, "a promise should be returned");

		return pBundle.then(function(oBundle) {
			assert.notOk(oBundle, "no bundle is loaded");
		});
	});

	QUnit.test("async: testGetLibraryResourceBundle with i18n set to true in manifest.json", function(assert) {
		this.stub(sap.ui.loader._, 'getModuleState').returns(true);
		var fnOrigLoadResource = LoaderExtensions.loadResource;
		this.stub(LoaderExtensions, 'loadResource').callsFake(function(sURL) {
			if (typeof sURL === "string" && sURL.indexOf("manifest.json") !== -1) {
				return {
					"_version": "1.9.0",
					"sap.ui5": {
						"library": {
							"i18n": true
						}
					}
				};
			} else {
				fnOrigLoadResource.apply(this, arguments);
			}

		});

		var oSpySapUiRequireToUrl = this.spy(sap.ui.require, 'toUrl'),
			pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test.i18ntrue", "de", true),
			oSpyCall;

		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(oSpySapUiRequireToUrl.callCount, 1, "sap.ui.require.toUrl is called");

		oSpyCall = oSpySapUiRequireToUrl.getCall(0);

		assert.equal(oSpyCall.args[0], 'sap/test/i18ntrue/messagebundle.properties', 'sap.ui.resource is called with the given message bundle name');

		return pBundle.then(function(oBundle) {
			oSpySapUiRequireToUrl.restore();
			assert.ok(oBundle, "Bundle should be loaded");
		});
	});

	QUnit.test("async: testGetLibraryResourceBundle with i18n missing in manifest.json", function(assert) {
		this.stub(sap.ui.loader._, 'getModuleState').returns(true);
		// no i18n property in manifest
		this.stub(LoaderExtensions, 'loadResource').returns(undefined);

		var oSpySapUiRequireToUrl = this.spy(sap.ui.require, 'toUrl'),
			pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test.i18nmissing", "fr", true),
			oSpyCall;

		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(oSpySapUiRequireToUrl.callCount, 1, "sap.ui.require.toUrl is called");

		oSpyCall = oSpySapUiRequireToUrl.getCall(0);

		assert.equal(oSpyCall.args[0], 'sap/test/i18nmissing/messagebundle.properties', 'sap.ui.resource is called with default message bundle name');

		oSpySapUiRequireToUrl.restore();

		return pBundle;
	});

	QUnit.test("async: testGetLibraryResourceBundle with a given i18n string in manifest.json", function(assert) {
		this.stub(sap.ui.loader._, 'getModuleState').returns(true);

		var fnOrigLoadResource = LoaderExtensions.loadResource;

		 this.stub(LoaderExtensions, 'loadResource').callsFake(function(sURL) {
			if (typeof sURL === "string" && sURL.indexOf("manifest.json") !== -1) {
				return {
					"_version": "1.9.0",
					"sap.ui5": {
						"library": {
							"i18n": "i18n.properties"
						}
					}
				};
			} else {
				fnOrigLoadResource.apply(this, arguments);
			}

		});

		var oSpySapUiRequireToUrl = this.spy(sap.ui.require, 'toUrl'),
			pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test.i18nstring", "en", true),
			oSpyCall;

		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(oSpySapUiRequireToUrl.callCount, 1, "sap.ui.require.toUrl is called");

		oSpyCall = oSpySapUiRequireToUrl.getCall(0);

		assert.equal(oSpyCall.args[0], 'sap/test/i18nstring/i18n.properties', 'sap.ui.resource is called with the given message bundle name');

		oSpySapUiRequireToUrl.restore();

		return pBundle;
	});

	QUnit.test("async: testGetLibraryResourceBundle with a given i18n object in manifest.json", function(assert) {
		var oResourceBundleCreateMock = this.mock(ResourceBundle).expects('create').once().withExactArgs({
			async: true,
			fallbackLocale: undefined,
			locale: "en",
			supportedLocales: ["en", "de"],
			url: "../../../../../resources/sap/test/i18nobject/i18n.properties"
		});

		this.stub(sap.ui.loader._, 'getModuleState').returns(true);

		var fnOrigLoadResource = LoaderExtensions.loadResource;

		this.stub(LoaderExtensions, 'loadResource').callsFake(function(sURL) {
			if (typeof sURL === "string" && sURL.indexOf("manifest.json") !== -1) {
				return {
					"_version": "1.9.0",
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
				};
			} else {
				fnOrigLoadResource.apply(this, arguments);
			}

		});

		var oSpySapUiRequireToUrl = this.spy(sap.ui.require, 'toUrl'),
			pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test.i18nobject", "en", true),
			oSpyCall;

		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(oSpySapUiRequireToUrl.callCount, 1, "sap.ui.require.toUrl is called");

		oSpyCall = oSpySapUiRequireToUrl.getCall(0);

		assert.equal(oSpyCall.args[0], 'sap/test/i18nobject/i18n.properties', 'sap.ui.resource is called with the given message bundle name');

		oSpySapUiRequireToUrl.restore();

		oResourceBundleCreateMock.restore();
		return pBundle;
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

		assert.equal(iCounter, 1, "jQuery.sap.resources is called once");
		pBundle = sap.ui.getCore().getLibraryResourceBundle("sap.test3", "en", true);
		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(iCounter, 1, "jQuery.sap.resources is still called once");

		return pBundle;
	});


	// ---------------------------------------------------------------------------
	// loadLibraries
	// ---------------------------------------------------------------------------

	QUnit.module("loadLibraries (from server)", {
		beforeEach: function(assert) {
			assert.notOk(sap.ui.getCore().getConfiguration().getDebug(), "debug mode must be deactivated to properly test library loading");
			this.oldCfgPreload = oRealCore.oConfiguration.preload;
		},
		afterEach: function(assert) {
			oRealCore.oConfiguration.preload = this.oldCfgPreload;
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

		oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload

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
			assert.strictEqual(vResult, undefined, "Promise should have no fulfillment value");
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
			assert.ok(!jQuery.sap.getObject('testlibs.scenario1.lib6'), "lib6 should not have been loaded");
			assert.ok(!sap.ui.getCore().getLoadedLibraries()['testlibs.scenario1.lib6'], "Core should not know or report lib6 as 'loaded'");
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib6\/library-preload\.js$/));
			// TODO (sync initLibrary) sinon.assert.neverCalledWith(jQuery.sap.require, 'testlibs.scenario1.lib6.library');
			// TODO (sync initLibrary) sinon.assert.neverCalledWith(sap.ui.require, ['testlibs/scenario1/lib6/library']);

			// lib7 should have been loaded as individual file
			assert.isLibLoaded('testlibs.scenario1.lib7');
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario1\/lib7\/library-preload\.js$/));
			// TODO (sync initLibrary) sinon.assert.neverCalledWith(jQuery.sap.require, 'testlibs.scenario1.lib7.library');
			// TODO (sync initLibrary) sinon.assert.calledWith(sap.ui.require, ['testlibs/scenario1/lib7/library']);

		});

	});

	/*
	 * Scenario2: same as Scenario1, but loaded sync
	 */
	QUnit.test("multiple libraries (sync, preloads are active)", function(assert) {

		oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload

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
		assert.ok(!jQuery.sap.getObject('testlibs.scenario2.lib6'), "lib6 should not have been loaded");
		assert.ok(!sap.ui.getCore().getLoadedLibraries()['testlibs.scenario2.lib6'], "Core should not know or report lib6 as 'loaded'");
		sinon.assert.neverCalledWith(sap.ui.requireSync, sinon.match(/scenario2\/lib6\/library-preload$/));

		assert.isLibLoaded('testlibs.scenario2.lib7');
		sinon.assert.calledWith(sap.ui.requireSync, sinon.match(/scenario2\/lib7\/library-preload$/));

	});

	/*
	 * Scenario3: one missing lib
	 */
	QUnit.test("multiple libraries, one missing (async, preloads are active)", function(assert) {

		oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload
		var vResult = sap.ui.getCore().loadLibraries(['testlibs.scenario3.lib1', 'testlibs.scenario3.lib2']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.ok(false, "Promise for missing lib should not resolve");
		}, function(e) {
			assert.ok(true, "Promise for missing library should be rejected");
			assert.ok(typeof e === 'object' && /failed to/.test(e.message), "rejected Promise should report an error");
			// TODO check that only lib4 failed
		});
	});

	/*
	 * Scenario4: cycle
	 */
	QUnit.test("two libraries, depending on each other (lib cycle, but not module cycle, async, preloads are active)", function(assert) {

		oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload
		var vResult = sap.ui.getCore().loadLibraries(['testlibs.scenario4.lib1', 'testlibs.scenario4.lib2']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.isLibLoaded('testlibs.scenario4.lib1');
			assert.isLibLoaded('testlibs.scenario4.lib2');
		}, function(e) {
			assert.ok(false, "Promise for libs with cyclic dependency should not be rejected");
		});
	});

	/*
	 * Scenario5: conflicting async and sync calls
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

		oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload
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
		});
	});

	/*
	 * Scenario6:
	 *
	 *   lib1 (json)
	 *     -> none
	 *   lib2 (json)
	 *     -> none
	 */
	QUnit.test("suppress access to js file by configuration", function(assert) {

		oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload

		// clear the version information in case it's already set
		// because the legacy option 'json' isn't supported by fetching transitive closure
		sap.ui.versioninfo = null;

		this.spy(sap.ui, 'requireSync');
		sap.ui.getCore().loadLibraries([ { name: 'testlibs.scenario6.lib1', json: true } ], { async: false });
		assert.isLibLoaded('testlibs.scenario6.lib1');
		sinon.assert.neverCalledWith(sap.ui.requireSync, sinon.match(/scenario6\/lib1\/library-preload$/));

		this.spy(sap.ui.loader._, "loadJSResourceAsync");
		return sap.ui.getCore().loadLibraries([ { name: 'testlibs.scenario6.lib2', json: true } ]).then(function() {
			assert.isLibLoaded('testlibs.scenario6.lib2');
			sinon.assert.notCalled(sap.ui.loader._.loadJSResourceAsync);
		});

	});

	QUnit.test("type creation", function (assert) {
		sap.ui.getCore().loadLibrary("testlibs.myGlobalLib");
		// previously the global export of the DataType module was overwritten during
		// the type processing in the library init
		assert.equal(testlibs.myGlobalLib.types.HalfTheTruth.value, 21);
	});

	// ---------------------------------------------------------------------------
	// loadLibrary
	// ---------------------------------------------------------------------------

	QUnit.module("loadLibrary", {
		beforeEach: function(assert) {
			assert.notOk(sap.ui.getCore().getConfiguration().getDebug(), "debug mode must be deactivated to properly test library loading");
			this.oldCfgPreload = oRealCore.oConfiguration.preload;
			oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload
		},
		afterEach: function(assert) {
			oRealCore.oConfiguration.preload = this.oldCfgPreload;
			delete window.testlibs;
		}
	});

	/*
	 * Scenario9: (mocked)
	 *	lib1 -> no dependencies
	 */
	QUnit.test("async (config object)", function(assert) {

		this.stub(sap.ui.loader._, "loadJSResourceAsync").callsFake(function() {
			jQuery.sap.declare('testlibs.scenario9.lib1.library');
			sap.ui.getCore().initLibrary({
				name: 'testlibs.scenario9.lib1',
				noLibraryCSS: true
			});
			return Promise.resolve(true);
		});

		var loaded = sap.ui.getCore().loadLibrary("testlibs.scenario9.lib1", {
			async: true,
			url: "./some/fancy/path"
		});
		assert.ok(loaded instanceof Promise, "loadLibrary should return a promise when called with async:true");
		assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(sinon.match(/testlibs\/scenario9\/lib1\/library/)), "should have called _loadJSResourceAsync for library.js");
		assert.equal(jQuery.sap.getResourcePath('testlibs/scenario9/lib1'), "./some/fancy/path", "path should have been registered");

		return loaded;
	});

	/*
	 * Scenario10: (mocked)
	 *	lib1 -> no dependencies
	 */
	QUnit.test("async (convenience shortcut)", function(assert) {

		this.stub(sap.ui.loader._, "loadJSResourceAsync").callsFake(function() {
			jQuery.sap.declare('testlibs.scenario10.lib1.library');
			sap.ui.getCore().initLibrary({
				name: 'testlibs.scenario10.lib1',
				noLibraryCSS: true
			});
			return Promise.resolve(true);
		});

		var loaded = sap.ui.getCore().loadLibrary("testlibs.scenario10.lib1", true);
		assert.ok(loaded instanceof Promise, "loadLibrary should return a promise when called with async:true");
		assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(sinon.match(/testlibs\/scenario10\/lib1\/library/)), "should have called _loadJSResourceAsync for library.js");

		return loaded;
	});

	/*
	 * Scenario11:
	 *	lib1 -> preload does not exist
	 */
	QUnit.test("async (missing preload)", function(assert) {

		this.stub(sap.ui.loader._, "loadJSResourceAsync").callsFake(function() {
			return Promise.reject(new Error());
		});
		this.stub(sap.ui, "require").callsFake(function(name, callback) {
			jQuery.sap.declare('testlibs.scenario11.lib1.library');
			sap.ui.getCore().initLibrary({
				name: 'testlibs.scenario11.lib1',
				noLibraryCSS: true
			});
			setTimeout(function() {
				callback({});
			}, 0);
		});

		var loaded = sap.ui.getCore().loadLibrary("testlibs.scenario11.lib1", true);
		assert.ok(loaded instanceof Promise, "loadLibrary should return a promise when called with async:true");
		assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(sinon.match(/testlibs\/scenario11\/lib1\/library/)), "should have called _loadJSResourceAsync for library.js");

		return loaded.then(function() {
			assert.ok(sap.ui.require.calledWith(['testlibs/scenario11/lib1/library']), "should have called jQuery.sap.require for library.js");
			assert.ok(true, "promise for a library without preload should resolve");
		}, function() {
			assert.ok(false, "promise for a library without preload should not be rejected");
		});

	});

	/*
	 * Scenario12:
	 *	lib1 -> does not exist
	 */
	QUnit.test("async (missing library)", function(assert) {

		this.stub(sap.ui.loader._, "loadJSResourceAsync").callsFake(function() {
			return Promise.reject(new Error());
		});

		var loaded = sap.ui.getCore().loadLibrary("testlibs.scenario12.lib1", true);
		assert.ok(loaded instanceof Promise, "loadLibrary should return a promise when called with async:true");
		assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(sinon.match(/testlibs\/scenario12\/lib1\/library/)), "should have called _loadJSResourceAsync for library.js");

		return loaded.then(function() {
			assert.ok(false, "promise for a missing library should not resolve");
		}, function() {
			assert.ok(true, "promise for a missing library should be rejected");
		});

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

			oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload

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
				assert.strictEqual(vResult, undefined, "Promise should have no fulfillment value");
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
				assert.ok(!jQuery.sap.getObject('testlibs.scenario13.lib6'), "lib6 should not have been loaded");
				assert.ok(!sap.ui.getCore().getLoadedLibraries()['testlibs.scenario13.lib6'], "Core should not know or report lib6 as 'loaded'");
				sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib6\/library-preload\.js$/));

				// lib7 should have been loaded as individual file
				assert.isLibLoaded('testlibs.scenario13.lib7');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario13\/lib7\/library-preload\.js$/));

			});
		}.bind(this));
	});

	/*
	 * Scenario14:
	 *
	 *   lib1 (js)
	 *     -> lib2 (js), lib5 (js)
	 *   lib2 (js)
	 *     -> lib3 (js), lib5 (js, lazy: true), lib6 (js)
	 */
	QUnit.test("multiple libs (async, preloads) with transitive dependency closure, one lib is not in the sap.ui.versioninfo", function(assert) {

		// make lib4 already loaded
		sap.ui.predefine('testlibs/scenario14/lib4/library', [], function() {
			sap.ui.getCore().initLibrary({
				name: 'testlibs.scenario14.lib4'
			});
			return testlibs.scenario14.lib4;
		});

		return LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("testlibs/scenario14/sap-ui-version.json"),
			async: true
		}).then(function(versioninfo) {
			sap.ui.versioninfo = versioninfo;

			oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload

			this.spy(sap.ui.loader._, 'loadJSResourceAsync');
			this.spy(sap.ui, 'require');
			this.spy(sap.ui, 'requireSync');

			var vResult = sap.ui.getCore().loadLibraries(['testlibs.scenario14.lib8']);
			// initial request for lib 8 preload
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib8\/library-preload\.js$/));

			// loading of other libs should not be triggered yet
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib1\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib2\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib3\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib4\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib5\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib6\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib7\/library-preload\.js$/));

			assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

			return vResult.then(function(vResult) {
				assert.strictEqual(vResult, undefined, "Promise should have no fulfillment value");

				// 1-3
				assert.isLibLoaded('testlibs.scenario14.lib1');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib1\/library-preload\.js$/));
				assert.isLibLoaded('testlibs.scenario14.lib2');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib2\/library-preload\.js$/));
				assert.isLibLoaded('testlibs.scenario14.lib3');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib3\/library-preload\.js$/));

				// lib 4 is already loaded
				assert.isLibLoaded('testlibs.scenario14.lib4');
				sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib4\/library-preload\.js$/));

				// 5-7
				assert.isLibLoaded('testlibs.scenario14.lib5');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib5\/library-preload\.js$/));
				assert.isLibLoaded('testlibs.scenario14.lib6');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib6\/library-preload\.js$/));
				assert.isLibLoaded('testlibs.scenario14.lib7');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib7\/library-preload\.js$/));
			});
		}.bind(this));
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
			assert.notOk(sap.ui.getCore().getConfiguration().getDebug(), "debug mode must be deactivated to properly test library loading");
			this.server = sinon.fakeServer.create();
			this.server.autoRespond = true;
			this.oldCfgPreload = oRealCore.oConfiguration.preload;
		},
		afterEach: function(assert) {
			oRealCore.oConfiguration.preload = this.oldCfgPreload;
			this.server.restore();
			delete window.my;
		}
	});



	QUnit.test("multiple libraries (async, preloads are deactivated)", function(assert) {

		this.server.respondWith(/my\/lib3\/library\.js/, makeLib('my.lib3'));
		this.server.respondWith(/my\/lib4\/library\.js/, makeLib('my.lib4'));

		oRealCore.oConfiguration.preload = 'off';
		var vResult = sap.ui.getCore().loadLibraries(['my.lib3', 'my.lib4']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.isLibLoaded('my.lib3');
			assert.isLibLoaded('my.lib4');
		});
	});

	QUnit.test("multiple libraries, one missing (async, preloads are activate)", function(assert) {

		this.server.respondWith(/my\/lib5\/library-preload\.json/, makeLibPreloadJSON('my.lib5'));

		oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload
		var vResult = sap.ui.getCore().loadLibraries(['my.non.existing.lib', 'my.lib5']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.ok(false, "Promise for missing lib should not resolve");
		}, function(e) {
			assert.ok(true, "Promise for missing library should be rejected");
			assert.ok(typeof e === 'object' && /failed to/.test(e.message), "rejected Promise should report an error");
		});
	});

	QUnit.test("multiple libraries, one missing (async, preloads are deactivated)", function(assert) {

		this.server.respondWith(/my\/lib6\/library\.js/, makeLib('my.lib6'));

		oRealCore.oConfiguration.preload = 'off';
		var vResult = sap.ui.getCore().loadLibraries(['my.lib6', 'my.non.existing.lib2']);
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.ok(false, "Promise for missing lib should not resolve");
		}, function(e) {
			assert.ok(true, "Promise for missing library should be rejected");
			assert.ok(typeof e === 'object' && /failed to/.test(e.message), "rejected Promise should report an error");
		});
	});

	QUnit.test("multiple libraries (sync, existing, preload on)", function(assert) {

		this.server.respondWith(/my\/lib7\/library-preload\.json/, makeLibPreloadJSON('my.lib7'));
		this.server.respondWith(/my\/lib8\/library-preload\.json/, makeLibPreloadJSON('my.lib8'));

		oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload
		var vResult = sap.ui.getCore().loadLibraries(['my.lib7', 'my.lib8'], { async: false });
		assert.ok(vResult == null, "sync call to loadLibraries must not return a value");
		assert.isLibLoaded('my.lib7');
		assert.isLibLoaded('my.lib8');
	});

	QUnit.test("multiple libraries (sync, existing, preload off)", function(assert) {

		this.server.respondWith(/my\/lib9\/library\.js/, makeLib('my.lib9'));
		this.server.respondWith(/my\/lib10\/library\.js/, makeLib('my.lib10'));

		oRealCore.oConfiguration.preload = 'off';
		var vResult = sap.ui.getCore().loadLibraries(['my.lib9', 'my.lib10'], { async: false });
		assert.ok(vResult == null, "sync call to loadLibraries must not return a value");
		assert.isLibLoaded('my.lib9');
		assert.isLibLoaded('my.lib10');
	});

	QUnit.test("multiple libraries, one missing (sync, non-existing)", function(assert) {

		this.server.respondWith(/my\/lib11\/library\.js/, makeLib('my.lib11'));

		oRealCore.oConfiguration.preload = 'off';
		try {
			sap.ui.getCore().loadLibraries(['my.non.existing.lib3', 'my.lib11'], { async: false });
			assert.ok(false, "sync loadLibraries for missing lib must not succeed");
		} catch (e) {
			assert.ok(true, "sync loadLibraries should throw an exception");
			assert.ok(typeof e === 'object' && /failed to/.test(e.message), "exception should report an error");
		}
	});

	QUnit.test("multiple libraries (async, preloads are active, preloadOnly)", function(assert) {

		this.server.respondWith(/my\/lib12\/library-preload\.json/, makeLibPreloadJSON('my.lib12'));
		this.server.respondWith(/my\/lib13\/library-preload\.json/, makeLibPreloadJSON('my.lib13'));

		oRealCore.oConfiguration.preload = 'sync'; // sync or async both activate the preload
		var vResult = sap.ui.getCore().loadLibraries(['my.lib12', 'my.lib13'], { preloadOnly: true });
		assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

		return vResult.then(function() {
			assert.ok(!jQuery.sap.getObject('my.lib12'), "lib12 should not have been loaded");
			assert.ok(!sap.ui.getCore().getLoadedLibraries()['my.lib12'], "Core should not know or report lib12 as 'loaded'");
			assert.ok(jQuery.sap.isResourceLoaded('my/lib12/library.js'), "lib12 library module should be preloaded");
			assert.ok(!jQuery.sap.getObject('my.lib13'), "lib13 should not have been loaded");
			assert.ok(!sap.ui.getCore().getLoadedLibraries()['my.lib13'], "Core should not know or report lib13 as 'loaded'");
			assert.ok(jQuery.sap.isResourceLoaded('my/lib13/library.js'), "lib13 library module should be preloaded");
		});
	});

	QUnit.test("Test piggyback access of private Core methods", function(assert) {

		var oCoreInternals;
		var oErrorLogSpy = sinon.spy(Log, "error");

		sap.ui.getCore().registerPlugin({
			startPlugin : function(oCore) {
				oCoreInternals = oCore;
			}
		});

		var oElementA = new Element("A");
		var oElementB = new Element("B");

		assert.ok(Object.keys(oCoreInternals.mElements).length, 2, "Return all registered Element instances");
		assert.equal(oErrorLogSpy.getCall(0).args[0], "oCore.mElements was a private member and has been removed. Use one of the methods in sap.ui.core.Element.registry instead", "Logs error on private methode access");

		oErrorLogSpy.reset();
		oElementA.destroy();
		oElementB.destroy();
	});

	QUnit.start();
});
