jQuery.sap.declare("sap.m.sample.PredefinedMarginsAll.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.PredefinedMarginsAll.Component", {

	metadata : {
		rootView : "sap.m.sample.PredefinedMarginsAll.Page",
		dependencies : {
			libs : [
				"sap.m"
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