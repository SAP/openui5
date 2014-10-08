jQuery.sap.declare("sap.m.sample.FlexBox.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FlexBox.Component", {

	metadata : {
		rootView : "sap.m.sample.FlexBox.V",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"V.view.xml",
					"C.controller.js"
				]
			}
		}
	}
});