sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.UploadCollectionVersioning.Component", {

		metadata : {
			rootView : "sap.m.sample.UploadCollectionVersioning.Page",
			dependencies : {
				libs : [ "sap.m", "sap.ui.unified" ]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Page.view.xml",
						"Page.controller.js",
						"uploadCollection.json"
					]
				}
			}
		}
	});

	return Component;
});