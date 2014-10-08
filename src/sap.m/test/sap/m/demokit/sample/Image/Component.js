jQuery.sap.declare("sap.m.sample.Image.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Image.Component", {

	metadata : {
		rootView : "sap.m.sample.Image.ImageGroup",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"ImageGroup.view.xml",
					"ImageGroup.controller.js"
				]
			}
		}
	}
});