sap.ui.define(["sap/base/Log", "sap/ui/core/mvc/Controller"], function(Log, Controller) {
	"use strict";

	return Controller.extend("testdata.customizing.async.integration.sap.controller.Main", {
		onInit: function() {
			Log.info("init - testdata.customizing.async.integration.sap.controller.Main");
		},
		onButtonPress: function() {}
	});
});