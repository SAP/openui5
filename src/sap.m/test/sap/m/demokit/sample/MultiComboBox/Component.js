jQuery.sap.declare("sap.m.sample.MultiComboBox.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MultiComboBox.Component", {

	metadata : {
		rootView : "sap.m.sample.MultiComboBox.Page",
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