sap.ui.define(['jquery.sap.global', 'testdata/customizing/customer/Component'],
	function(jQuery, CustomerComponent) {
	"use strict";


	var Component = CustomerComponent.extend("testdata.customizing.customersub.Component", {

		metadata : {
			version : "1.0",

			customizing: {

				"sap.ui.controllerExtensions": {
					"testdata.customizing.sap.Sub2": "testdata.customizing.customersub.Sub2SubControllerExtension"
				},

				"sap.ui.controllerReplacements": {
					"testdata.customizing.sap.Main": {
						"controllerName": "testdata.customizing.customersub.Main"
					}
				}

			}
		}

	});


	return Component;

});
