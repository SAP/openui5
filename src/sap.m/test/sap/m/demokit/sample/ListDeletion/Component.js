jQuery.sap.declare("sap.m.sample.ListDeletion.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListDeletion.Component", {

	metadata : {
		rootView : "sap.m.sample.ListDeletion.List",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"List.view.xml",
					"List.controller.js"
				]
			}
		}
	}
});
