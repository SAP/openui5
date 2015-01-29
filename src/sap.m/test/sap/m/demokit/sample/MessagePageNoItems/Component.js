jQuery.sap.declare("sap.m.sample.MessagePageNoItems.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MessagePageNoItems.Component", {

	metadata : {
		rootView : "sap.m.sample.MessagePageNoItems.Page",
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
					"Page.controller.js"
				]
			}
		}
	}
});
