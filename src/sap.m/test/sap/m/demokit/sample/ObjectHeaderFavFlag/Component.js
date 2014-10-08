jQuery.sap.declare("sap.m.sample.ObjectHeaderFavFlag.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ObjectHeaderFavFlag.Component", {

	metadata : {
		rootView : "sap.m.sample.ObjectHeaderFavFlag.Page",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
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