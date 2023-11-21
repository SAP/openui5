/*global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/ui/thirdparty/jquery"
], function(Device, Log, ObjectPath, jQuery) {
	"use strict";

	// wraps jQuery.ajax to count and collect *.js requests
	var fnOldAjax = jQuery.ajax;
	var aAjaxCalls = [];
	var sRoot = sap.ui.require.toUrl("") + "/";

	jQuery.ajax = function(settings) {
		if ( settings && settings.url && /\.js$/.test(settings.url) ) {
			var sUrl = settings.url;
			sUrl = sUrl.slice(sUrl.indexOf(sRoot) == 0 ? sRoot.length : 0);
			if (sUrl.indexOf("sap/ui/thirdparty/") < 0) {
				aAjaxCalls.push(sUrl);
			}
		}
		return fnOldAjax.apply(this, arguments);
	};

	function ajaxCallsReset() {
		aAjaxCalls = [];
	}

	function ajaxCalls() {
		return aAjaxCalls;
	}

	function checkLibrary(assert, sLibraryName) {

		// ensure that assert.* even works if a test page doesn't provide 'assert' as a param (e.g. pages outside openui5 repo)
		assert = assert || window;

		// skip the bootstrap library checks
		if (/[?&]sap-ui-skip(B|-b)ootstrap(T|-t)ests=(true|x|X)/.test(top.location.search)) {
			assert.ok(true, "Skipped checkLibrary(\"" + sLibraryName + "\") due to availability of URL parameter!");
			return;
		}

		ajaxCallsReset();
		assert.ok(sap.ui.require(sLibraryName.replace(/\./g,"/") + "/library"), "module for library " + sLibraryName + " must have been declared");
		assert.ok(ObjectPath.get(sLibraryName), "namespace " + sLibraryName + " must exists");

		var oLib = sap.ui.getCore().getLoadedLibraries()[sLibraryName];
		assert.ok(!!oLib, "library info object must exists");

		// Check that all modules have been loaded. As we don't have access to the "all modules",
		// we simply check for all types, elements and controls
		// Note: the tests must not call functions/ctors to avoid side effects like lazy loading

		// we must exclude the primitive types - no module for them
		var aBuiltInTypes = ["any","boolean","float","int","object","string","void","function"];
		if ( Array.isArray(oLib.types) ) {
			oLib.types.forEach(function(sType) {
				if ( aBuiltInTypes.indexOf(sType) < 0 ) {
					var oClass = ObjectPath.get(sType);
					assert.ok(typeof oClass === "object", "type " + sType + " must be an object");
				}
			});
		}

		// check existence and lazy loader status
		var sMessage = "class must be a lazy loader only";
		var aExcludes = ["sap.ui.core.Element", "sap.ui.core.Control", "sap.ui.core.Component", "sap.ui.table.Column", "sap.ui.core.CustomData"];

		if ( Array.isArray(oLib.elements) ) {
			oLib.elements.forEach(function(sElement) {
				if ( aExcludes.indexOf(sElement) < 0 ) {
					assert.notEqual(sap.ui.require(sElement), true, "module for element " + sElement + " must have been declared");
					assert.equal(sap.ui.lazyRequire._isStub(sElement), true, sMessage + ":" + sElement);
					var oClass = ObjectPath.get(sElement);
					assert.equal(typeof oClass, "function", "Element constructor for " + sElement + " must exist and must be a function");
				}
			});
		}

		if ( Array.isArray(oLib.controls) ) {
			oLib.controls.forEach(function(sControl) {
				if ( aExcludes.indexOf(sControl) < 0 ) {
					assert.notEqual(sap.ui.require(sControl), true, "module for element " + sControl + " must have been declared");
					assert.equal(sap.ui.lazyRequire._isStub(sControl), true, sMessage + ":" + sControl);
					var oClass = ObjectPath.get(sControl);
					assert.equal(typeof oClass, "function", "Control constructor for " + sControl + " must exist and must be a function");
				}
			});
		}

		if ( Array.isArray(oLib.elements) ) {
			oLib.elements.forEach(function(sElement) {
				var FNClass = ObjectPath.get(sElement);
				try {
					new FNClass();
				} catch (e) {
					Log.error(e.message || e);
				}
				FNClass = ObjectPath.get(sElement);
				assert.ok(typeof FNClass.prototype.getMetadata === "function", "Element class " + sElement + " should have been loaded and initialized");
			});
		}

		if ( Array.isArray(oLib.controls) ) {
			oLib.controls.forEach(function(sControl) {
				var FNClass = ObjectPath.get(sControl);
				try {
					new FNClass();
				} catch (e) {
					Log.error(e.message || e);
				}
				FNClass = ObjectPath.get(sControl);
				assert.ok(typeof FNClass.prototype.getMetadata === "function", "Control class " + sControl + " should have been loaded and initialized");
			});
		}

		assert.deepEqual(ajaxCalls(), [], "no additional ajax calls should have happened");

	}

	QUnit.test("Check Existance of Core", function(assert) {
		/* check that SAPUI5 has been loaded */
		assert.ok(jQuery.sap, "jQuery.sap namespace exists");
		assert.ok(window.sap, "sap namespace exists");
		assert.ok(sap.ui, "sap.ui namespace exists");
		assert.ok(typeof sap.ui.getCore === "function", "sap.ui.getCore exists");
		assert.ok(sap.ui.getCore(), "sap.ui.getCore() returns a value");

		var id = jQuery("html").attr("data-sap-ui-browser");
		if ( Device.browser.name ) {
			assert.ok(typeof id === "string" && id, "browser is known: data-sap-ui-browser should have been set and must not be empty");
		} else {
			assert.ok(!id, "browser is unknown: data-sap-ui-browser should not have been set (or empty)");
		}
	});

	["sap.ui.core","sap.ui.layout","sap.m", "sap.ui.table"].forEach(function(sLib) {

		QUnit.test("Check that library " + sLib + " has been loaded", function(assert) {
			checkLibrary(assert, sLib);
		});

	});

});