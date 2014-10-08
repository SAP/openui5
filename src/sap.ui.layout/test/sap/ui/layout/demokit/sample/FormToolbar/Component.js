jQuery.sap.declare("sap.ui.layout.sample.FormToolbar.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.FormToolbar.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.FormToolbar.Panel",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"Panel.view.xml",
					"Panel.controller.js"
				]
			}
		}
	}
});