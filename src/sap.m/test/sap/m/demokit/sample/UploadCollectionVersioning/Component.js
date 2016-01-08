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
						"uploadCollection.json",
						"UploadCollection/LinkedDocuments/Business Plan Agenda.doc",
						"UploadCollection/LinkedDocuments/Business Plan Topics.xls",
						"UploadCollection/LinkedDocuments/Document.txt",
						"UploadCollection/LinkedDocuments/Instructions.pdf",
						"UploadCollection/LinkedDocuments/Notes.txt",
						"UploadCollection/LinkedDocuments/Screenshot.jpg",
						"UploadCollection/LinkedDocuments/Third Quarter Results.ppt"
					]
				}
			}
		}
	});

	return Component;
});