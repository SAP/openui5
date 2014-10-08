jQuery.sap.declare("sap.m.sample.InputPassword.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.InputPassword.Component", {

	metadata : {
		rootView : "sap.m.sample.InputPassword.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml"
				]
			}
		}
	}
});