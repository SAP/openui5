sap.ui.define(['testdata/customizing/async/integration/sap/Component'],
	function(Component) {
	"use strict";

	// extends from testdata.customizing.async.integration.sap.Component
	return Component.extend("testdata.customizing.async.integration.customer.Component", {
		metadata : {
			version : "1.0",
			customizing: {
				"sap.ui.viewExtensions": {
					"testdata.customizing.async.integration.sap.views.JSView1.view": {
						"ExtPoint1": {
							"className": "sap.ui.core.mvc.View",
							"viewName": "testdata.customizing.async.integration.customer.extensionPoints.ExtPoint1View",
							"type": "XML",
							"id": "extPoint1View"
						},
						"ExtPoint2": {
							"className": "sap.ui.core.Fragment",
							"fragmentName": "testdata.customizing.async.integration.customer.extensionPoints.ExtPoint2Fragment",
							"type": "XML"
						}
					}
				},
				"sap.ui.viewModifications": {
					"testdata.customizing.async.integration.sap.views.JSView1.view": {
						"customizableText1": {
							"visible": false
						},
						// modify property for control that comes with the ExtPoint2Fragment
						"buttonExtPoint2_1": {
							"visible": false
						}
					},
					// modify property for control that comes with the ExtPoint1View
					"testdata.customizing.async.integration.customer.extensionPoints.ExtPoint1View": {
						"buttonExtPoint1_1": {
							"visible": false
						}
					}
				}
			}
		}
	});
});
