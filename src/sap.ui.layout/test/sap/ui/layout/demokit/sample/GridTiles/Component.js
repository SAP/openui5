jQuery.sap.declare("sap.ui.layout.sample.GridTiles.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.GridTiles.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.GridTiles.Grid",
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
					"Grid.controller.js",
					"Formatter.js"
				]
			}
		}
	}
});