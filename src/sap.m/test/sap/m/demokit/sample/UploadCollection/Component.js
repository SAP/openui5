jQuery.sap.declare("sap.m.sample.UploadCollection.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.UploadCollection.Component", {

	metadata : {
		rootView : "sap.m.sample.UploadCollection.Page",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"Page.view.xml",
					"Page.controller.js",
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