sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.UploadCollectionSortingFiltering.Component", {

		metadata : {
			rootView : "sap.m.sample.UploadCollectionSortingFiltering.Page",
			dependencies : {
				libs : [ "sap.m", "sap.ui.unified" ]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Dialog.fragment.xml",
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