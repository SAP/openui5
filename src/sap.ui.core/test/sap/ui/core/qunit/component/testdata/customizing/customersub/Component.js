sap.ui.define([
	"testdata/customizing/customer/Component"
], function(CustomerComponent) {
	"use strict";

	var Component = CustomerComponent.extend("testdata.customizing.customersub.Component", {
		metadata : {
			version : "1.0",

			customizing: {

				"sap.ui.viewExtensions": {
					"testdata.customizing.sap.Sub2": {
						"extension2": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.customersub.CustomFrag1WithCustomerAction",
							type: "XML"
						}
					}
				},

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
