jQuery.sap.declare("sap.m.sample.ListFooter.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListFooter.Component", {

	metadata : {
		rootView : "sap.m.sample.ListFooter.List",
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