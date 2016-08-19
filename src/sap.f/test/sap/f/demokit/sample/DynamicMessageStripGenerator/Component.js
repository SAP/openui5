jQuery.sap.declare("sap.f.sample.DynamicMessageStripGenerator.Component");

sap.ui.core.UIComponent.extend("sap.f.sample.DynamicMessageStripGenerator.Component", {

	metadata : {
		rootView : "sap.f.sample.DynamicMessageStripGenerator.V",
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
					"C.controller.js"
				]
			}
		}
	}
});