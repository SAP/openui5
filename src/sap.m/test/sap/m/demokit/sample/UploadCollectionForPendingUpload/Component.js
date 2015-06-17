sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.UploadCollectionForPendingUpload.Component", {

		metadata : {
			rootView : "sap.m.sample.UploadCollectionForPendingUpload.Page",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout",
					"sap.ui.unified"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Page.view.xml",
						"Page.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
