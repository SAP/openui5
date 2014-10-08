jQuery.sap.declare("sap.m.sample.ListLoading.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.ListLoading.Component", {

	metadata : {
		rootView : "sap.m.sample.ListLoading.List",
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
					"List.controller.js",
					"MockServer.js"
				]
			}
		}
	}
});