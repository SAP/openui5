jQuery.sap.declare("sap.ui.core.sample.InvisibleText.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.InvisibleText.Component", {

	metadata : {
		rootView : "sap.ui.core.sample.InvisibleText.V",
		dependencies : {
			libs : [
				"sap.m"
			]
		},
		config : {
			sample : {
				stretch : true,
				files : [
					"V.view.xml",
					"V.controller.js"
				]
			}
		}
	}
});