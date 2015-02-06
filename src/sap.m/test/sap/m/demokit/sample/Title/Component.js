jQuery.sap.declare("sap.m.sample.Title.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Title.Component", {

	metadata : {
		rootView : "sap.m.sample.Title.V",
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