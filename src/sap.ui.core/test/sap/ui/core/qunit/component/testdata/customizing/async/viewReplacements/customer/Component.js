sap.ui.define(['testdata/customizing/async/viewReplacements/sap/Component'],
	function(Component) {
	"use strict";

	// extends from testdata.customizing.async.viewReplacements.sap.Component
	return Component.extend("testdata.customizing.async.viewReplacements.customer.Component", {
		metadata : {
			version : "1.0",
			customizing: {
				"sap.ui.viewReplacements": {
					"testdata.customizing.async.viewReplacements.sap.views.XMLView1": {
						"viewName": "testdata.customizing.async.viewReplacements.customer.views.XMLView1Replacement",
						"type": "XML"
					}
				},
				"sap.ui.viewModifications": {
					"testdata.customizing.async.viewReplacements.customer.views.XMLView1Replacement": {
						"textXMLView1Replacement": {
							"visible": false
						}
					}
				}
			}
		}
	});
});
