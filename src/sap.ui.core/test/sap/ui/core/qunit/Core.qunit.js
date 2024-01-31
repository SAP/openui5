/*global QUnit, sinon, testlibs */
sap.ui.define([
	'sap/base/i18n/Localization',
	'sap/base/util/ObjectPath',
	'sap/ui/Device',
	'sap/ui/core/Lib',
	"sap/ui/qunit/utils/nextUIUpdate"
], function(Localization, ObjectPath, Device, Library, nextUIUpdate) {
	"use strict";

	var privateLoaderAPI = sap.ui.loader._;

	function _providesPublicMethods(/**sap.ui.base.Object*/oObject, /** function */ fnClass, /**boolean*/ bFailEarly) {
		var aMethodNames = null,
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

	// custom assertion
	QUnit.assert.equalControls = function(actual, expected, message) {
		this.ok(actual === expected, message);
	};

	QUnit.assert.isLibLoaded = function(libName) {
		this.ok(ObjectPath.get(libName), "namespace for " + libName + " should exist");
		this.ok(Library.all()[libName], "Core should know and list " + libName + " as 'loaded'");
	};

	// used to get access to the non-public core parts
	var oRealCore;
	var TestCorePlugin = function() {};
	TestCorePlugin.prototype.startPlugin = function(oCore, bOnInit) {
		oRealCore = oCore;
	};


	// ---------------------------------------------------------------------------
	// Basic functionality
	// ---------------------------------------------------------------------------

	QUnit.module("Basic");

	QUnit.test("Browser Version Test", function(assert) {
		assert.expect(4);
		var browser = Device.browser;
		var value = document.documentElement.getAttribute("data-sap-ui-browser");
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
		}

		if (!browser.safari || (!browser.fullscreen && !browser.webview)) {
			assert.ok(value.indexOf(Math.floor(version)) != -1, "Version is set right in data attribute");
		} else {
			assert.ok(!/[0-9]+$/.test(value), "unknown browser versions shouldn't be added to the data attribute");
		}

	});

	QUnit.test("Locale configuration (via Localization)", function(assert) {
		var oHtml = document.documentElement;
		var sLocale = Localization.getLanguageTag().toString();

		assert.equal(oHtml.getAttribute("lang"), sLocale, "lang attribute matches locale");

		sLocale = "de";
		Localization.setLanguage(sLocale);
		assert.equal(oHtml.getAttribute("lang"), sLocale, "lang attribute matches locale");
	});
});
