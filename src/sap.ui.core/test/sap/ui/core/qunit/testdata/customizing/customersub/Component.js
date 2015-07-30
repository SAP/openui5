sap.ui.define(['jquery.sap.global', 'testdata/customizing/customer/Component'],
	function(jQuery, Component1) {
	"use strict";

	
	var Component = Component1.extend("testdata.customizing.customersub.Component", {

		metadata : {
			version : "1.0",
		
			customizing: {
			
				"sap.ui.controllerExtensions": {
					"testdata.customizing.sap.Sub2": {
						"controllerName": "testdata.customizing.customersub.Sub2SubControllerExtension"
					}
				}
			}
		}

	});


	return Component;

});
