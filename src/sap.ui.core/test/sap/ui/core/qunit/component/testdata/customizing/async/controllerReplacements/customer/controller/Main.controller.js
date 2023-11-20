/*global QUnit */
sap.ui.define(["sap/base/Log", "sap/ui/core/mvc/Controller"], function(Log, Controller) {
	"use strict";

	return Controller.extend("testdata.customizing.async.controllerReplacements.customer.controller.Main", {
		onInit: function() {
			Log.info("init - testdata.customizing.async.controllerReplacements.customer.controller.Main");
		},
		onButtonPress: function(oEvent) {
			QUnit.assert.equal(this.getMetadata()._sClassName, "testdata.customizing.async.controllerReplacements.customer.controller.Main",
				"Controller replaced correctly.");
		}
	});
});