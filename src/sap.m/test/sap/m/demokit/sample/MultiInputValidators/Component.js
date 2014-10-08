jQuery.sap.declare("sap.m.sample.MultiInputValidators.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.MultiInputValidators.Component", {

	metadata : {
		rootView : "sap.m.sample.MultiInputValidators.Page",
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