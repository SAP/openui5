/* global QUnit*/

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/support/Support"
],
function(Lib, Support) {
	"use strict";

	QUnit.test("Load Support module and check App plugins", function(assert) {

		// save plugin module names which will be replaced with the actual instances
		var mLibs = Lib.all(),
			aPluginModuleNames = [];
		for (var n in mLibs) {
			var oLib = mLibs[n],
				aLibPlugins = [];
			if (oLib.extensions && oLib.extensions["sap.ui.support"] && oLib.extensions["sap.ui.support"].diagnosticPlugins) {
				aLibPlugins = oLib.extensions["sap.ui.support"].diagnosticPlugins;
			}
			if (aLibPlugins && Array.isArray(aLibPlugins)) {
				for (var i = 0; i < aLibPlugins.length; i++) {
					if (typeof aLibPlugins[i] === 'string' && aPluginModuleNames.indexOf(aLibPlugins[i]) === -1) {
						aPluginModuleNames.push(aLibPlugins[i]);
					}
				}
			}
		}

		var oSupport = Support.getStub();
		assert.equal(oSupport.getType(), Support.StubType.APPLICATION, "Support stub type equals APPLICATION");

		// Unable to open real window here as this causes problems in test execution (popup-blocker, ...)
		//oSupport.openSupportTool();

		// Load plugins directly
		return Support.initPlugins(oSupport, false).then(function() {
			// Check if all App plugins could be loaded
			var aPlugins = Support.getAppPlugins();
			for (var i = 0; i < aPlugins.length; i++) {
				assert.equal(aPlugins[i].isActive(), true, "Plugin '" + aPlugins[i].getMetadata().getName() + "' successfully loaded");
			}
		}).then(function() {

			// Unload plugins directly
			Support.exitPlugins(oSupport, false);

			// Check if all App plugins could be unloaded
			var aPlugins = Support.getAppPlugins();
			for (var i = 0; i < aPlugins.length; i++) {
				assert.equal(aPlugins[i].isActive(), false, "Plugin '" + aPlugins[i].getMetadata().getName() + "' successfully unloaded");
			}

		});
	});

});