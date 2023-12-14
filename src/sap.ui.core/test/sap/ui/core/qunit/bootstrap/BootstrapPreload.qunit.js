/*global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Lib"
], function(Device, Lib) {
	"use strict";

	QUnit.test("Check Existance of Core", function(assert) {
		assert.expect(8);
		/**
		 * @deprecated As of version 1.118.
		 */
		assert.expect(assert.expect() + 1);

		var aExpectedLibraries = ["sap.ui.core", "sap.m", "sap.ui.layout", "sap.ui.table"].sort();
		var aLoadedLibraries = Object.keys(Lib.all());
		var sExpectedLibrary, aDependendLibraries = [];

		/* check that SAPUI5 has been loaded */
		/**
		 * @deprecated As of version 1.118.
		 */
		assert.ok(sap.ui.getCore(), "sap.ui.getCore() returns a value");
		assert.ok(sap.ui.require("sap/ui/core/Core"), "Core module has been required");
		let isReady = false;
		sap.ui.require("sap/ui/core/Core").ready(() => { isReady = true; });
		assert.ok(isReady, "Core is ready");

		var id = document.querySelector("html").getAttribute("data-sap-ui-browser");
		if ( Device.browser.name ) {
			assert.strictEqual(id, Device.browser.name + Math.floor(Device.browser.versionStr), "browser is known: data-sap-ui-browser should have been set and must not be empty");
		} else {
			assert.ok(!id, "browser is unknown: data-sap-ui-browser should not have been set (or empty)");
		}

		aLoadedLibraries.forEach((sLoadedLibrary) => {
			if (!aDependendLibraries.includes(sLoadedLibrary) && !aExpectedLibraries.includes(sLoadedLibrary)) {
				// Don't collect duplicates and only collect dependend libraries which are not already expected
				aDependendLibraries.push(sLoadedLibrary);
			}
		});

		for (var i = 0; i < aExpectedLibraries.length; i++) {
			sExpectedLibrary = aExpectedLibraries[i];
			//assert.strictEqual(sExpectedLibrary + ".library", aConfigurationModules[i], "'" +  sExpectedLibrary + "' is part of sap.ui.core.Configuration property 'module'");
			assert.ok(aLoadedLibraries.includes(sExpectedLibrary) , "'" +  sExpectedLibrary + "' is registered as loadedLibrary within Core");
		}

		assert.strictEqual(aExpectedLibraries.concat(aDependendLibraries).length, Object.keys(aLoadedLibraries).length, "Only libraries declared in bootstrap including their dependencies are loaded");
	});

});