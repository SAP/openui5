jQuery.sap.declare("sap.m.sample.ListSelectionSearch.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListSelectionSearch.Component", {

	metadata : {
		rootView : "sap.m.sample.ListSelectionSearch.List",
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
					"List.view.xml",
					"List.controller.js"
				]
			}
		}
	}
});