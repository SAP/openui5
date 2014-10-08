jQuery.sap.declare("sap.m.sample.ObjectHeaderCondensed.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderCondensed.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderCondensed.V",
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