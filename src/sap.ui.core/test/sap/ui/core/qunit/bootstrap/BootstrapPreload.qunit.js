/*global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Configuration",
	"sap/ui/core/Core"
], function(Device, jQuery, Configuration, Core) {
	"use strict";

	QUnit.test("Check Existance of Core", function(assert) {
		assert.expect(9);

		var aExpectedLibraries = ["sap.m", "sap.ui.layout", "sap.ui.table"].sort();
		var aConfigurationModules = Configuration.getValue("modules").sort();
		var oLoadedLibraries = Core.getLoadedLibraries();
		var sExpectedLibrary, sLoadedLibrary, aDependendLibraries = [];

		/* check that SAPUI5 has been loaded */
		assert.ok(sap.ui.getCore(), "sap.ui.getCore() returns a value");

		var id = document.querySelector("html").getAttribute("data-sap-ui-browser");
		if ( Device.browser.name ) {
			assert.strictEqual(id, Device.browser.name + Device.browser.versionStr, "browser is known: data-sap-ui-browser should have been set and must not be empty");
		} else {
			assert.ok(!id, "browser is unknown: data-sap-ui-browser should not have been set (or empty)");
		}

		for (sLoadedLibrary in oLoadedLibraries) {
			if (!aDependendLibraries.includes(sLoadedLibrary) && !aExpectedLibraries.includes(sLoadedLibrary)) {
				// Don't collect duplicates and only collect dependend libraries which are not already expected
				aDependendLibraries.push(sLoadedLibrary);
			}
		}

		for (var i = 0; i < aExpectedLibraries.length; i++) {
			sExpectedLibrary = aExpectedLibraries[i];
			assert.strictEqual(sExpectedLibrary + ".library", aConfigurationModules[i], "'" +  sExpectedLibrary + "' is part of sap.ui.core.Configuration property 'module'");
			assert.ok(oLoadedLibraries[sExpectedLibrary], "'" +  sExpectedLibrary + "' is registered as loadedLibrary within Core");
		}

		assert.strictEqual(aExpectedLibraries.concat(aDependendLibraries).length, Object.keys(oLoadedLibraries).length, "Only libraries declared in bootstrap including their dependencies are loaded");
	});

});