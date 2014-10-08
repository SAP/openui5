jQuery.sap.declare("sap.ui.unified.sample.Currency.Component");

sap.ui.core.UIComponent.extend("sap.ui.unified.sample.Currency.Component", {

	metadata : {
		rootView : "sap.ui.unified.sample.Currency.View",
		dependencies : {
			libs : [
				"sap.ui.unified"
			]
		},

		config : {
			sample : {
				files : [
					"View.view.xml",
					"Controller.controller.js"
				]
			}
		}
	}
});