jQuery.sap.declare("sap.m.sample.ComboBox.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ComboBox.Component", {

	metadata : {
		rootView : "sap.m.sample.ComboBox.Page",
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