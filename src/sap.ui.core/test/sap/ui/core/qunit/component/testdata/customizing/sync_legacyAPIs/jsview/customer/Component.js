sap.ui.define([
	"testdata/customizing/sync_legacyAPIs/jsview/sap/Component"
], function(SapComponent) {
	"use strict";


	var Component = SapComponent.extend("testdata.customizing.sync_legacyAPIs.jsview.customer.Component", {

		metadata : {
			version : "1.0",
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			customizing: {

				"sap.ui.viewExtensions": {
					"testdata.customizing.sync_legacyAPIs.jsview.sap.Sub": {
						"extension42": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.sync_legacyAPIs.jsview.customer.JSCustomFragWithCustomAction",
							type: "JS"
						},
						"extension43": {
							className: "sap.ui.core.mvc.View",
							viewName: "testdata.customizing.sync_legacyAPIs.jsview.customer.JSCustomSubSubView",
							type: "JS"
						},
						"extension45": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.sync_legacyAPIs.jsview.customer.CustomTextFrag",
							type: "JS"
						}
					},
					"testdata.customizing.sync_legacyAPIs.jsview.customer.JSCustomSubSubView": {
						"extension44": {
							className: "sap.ui.core.Fragment",
							fragmentName: "testdata.customizing.sync_legacyAPIs.jsview.customer.MultiRootFragment",
							type: "JS"
						}
					}
				},

				"sap.ui.viewModifications": {
					"testdata.customizing.sync_legacyAPIs.jsview.sap.Sub": {
						"customizableText1": {
							"visible": false
						}
					}
				},

				"sap.ui.controllerExtensions": {
					"testdata.customizing.sync_legacyAPIs.jsview.sap.Sub": {
						"controllerNames": [
							"testdata.customizing.sync_legacyAPIs.jsview.customer.SubControllerExtension"
						]
					}
				}
			}
		}

	});


	return Component;

});
