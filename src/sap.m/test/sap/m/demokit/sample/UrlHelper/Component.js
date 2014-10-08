jQuery.sap.declare("sap.m.sample.UrlHelper.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.UrlHelper.Component", {

	metadata : {
		rootView : "sap.m.sample.UrlHelper.List",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"List.view.xml",
					"List.controller.js"
				]
			}
		}
	}
});