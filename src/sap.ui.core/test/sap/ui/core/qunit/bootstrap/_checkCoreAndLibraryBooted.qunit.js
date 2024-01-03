/*global QUnit */
(function() {
	"use strict";

	QUnit.test("Check Existance of Core", function(assert) {
		 return new Promise((resolve, reject) => {
			sap.ui.require(["sap/ui/core/Core", "sap/ui/core/Lib", "sap/ui/Device"], async function(Core, Lib, Device) {
				var aExpectedLibraries = ["sap.ui.core", "sap.m"];

				assert.ok(Core, "Core module exports a value");
				/**
				 * @deprecated As of version 1.118
				 * check that SAPUI5 has been loaded
				 */
				assert.ok(sap.ui.getCore(), "sap.ui.getCore() returns a value");

				await Core.ready();

				var id = document.querySelector("html").getAttribute("data-sap-ui-browser");
				if ( Device.browser.name ) {
					assert.strictEqual(id, Device.browser.name + Math.floor(Device.browser.versionStr), "browser is known: data-sap-ui-browser should have been set and must not be empty");
				} else {
					assert.ok(!id, "browser is unknown: data-sap-ui-browser should not have been set (or empty)");
				}

				var oLoadedLibraries = Lib.all();
				var sExpectedLibrary, sLoadedLibrary, aDependendLibraries = [];

				for (sLoadedLibrary in oLoadedLibraries) {
					if (!aDependendLibraries.includes(sLoadedLibrary) && !aExpectedLibraries.includes(sLoadedLibrary)) {
						// Don't collect duplicates and only collect dependend libraries which are not already expected
						aDependendLibraries.push(sLoadedLibrary);
					}
				}

				for (var i = 0; i < aExpectedLibraries.length; i++) {
					sExpectedLibrary = aExpectedLibraries[i];
					assert.ok(oLoadedLibraries[sExpectedLibrary], "'" +  sExpectedLibrary + "' is registered as loadedLibrary within Core");
				}

				assert.strictEqual(aExpectedLibraries.concat(aDependendLibraries).length, Object.keys(oLoadedLibraries).length, "Only libraries declared in bootstrap including their dependencies are loaded");

				resolve();
			}, reject);
		});
	});

}());