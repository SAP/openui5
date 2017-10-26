sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.UploadCollection.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.UploadCollection.Page",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [ "sap.m", "sap.ui.layout" ]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Page.view.xml",
						"Page.controller.js",
						"AppSettings.fragment.xml",
						"uploadCollection.json",
						"LinkedDocuments/Business Plan Agenda.doc",
						"LinkedDocuments/Business Plan Topics.xls",
						"LinkedDocuments/Document.txt",
						"LinkedDocuments/Instructions.pdf",
						"LinkedDocuments/Notes.txt",
						"LinkedDocuments/Screenshot.jpg",
						"LinkedDocuments/Third Quarter Results.ppt"
					]
				}
			}
		}
	});

	return Component;
});
