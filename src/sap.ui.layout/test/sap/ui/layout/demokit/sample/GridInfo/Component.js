jQuery.sap.declare("sap.ui.layout.sample.GridInfo.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.GridInfo.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.GridInfo.Grid",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"Grid.view.xml",
					"Grid.controller.js"
				]
			}
		}
	}
});