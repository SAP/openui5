sap.ui.define(["sap/base/Log", "sap/ui/core/mvc/Controller"], function(Log, Controller) {
	"use strict";

	return Controller.extend("testdata.customizing.async.integration.sap.controller.JSView1", {
		onInit: function() {
			Log.info("init - testdata.customizing.async.integration.sap.controller.JSView1");
		},
		onButtonPress: function() {}
	});
});