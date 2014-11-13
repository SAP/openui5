jQuery.sap.declare("sap.m.sample.UploadCollection.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.UploadCollection.Component", {

	metadata : {
		rootView : "sap.m.sample.UploadCollection.Page",
		dependencies : {
			libs : [
				"sap.m"
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