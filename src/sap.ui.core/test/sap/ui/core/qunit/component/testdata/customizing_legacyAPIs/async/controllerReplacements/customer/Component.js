sap.ui.define(['testdata/customizing/async/controllerReplacements/sap/Component'],
	function(Component) {
	"use strict";

	// extends from testdata.customizing.async.controllerReplacements.sap.Component
	return Component.extend("testdata.customizing.async.controllerReplacements.customer.Component", {
		metadata : {
			version : "1.0",
			customizing: {
				"sap.ui.controllerReplacements": {
					"testdata.customizing.async.controllerReplacements.sap.controller.Main": "testdata.customizing.async.controllerReplacements.customer.controller.Main"
				}
			}
		}
	});
});
