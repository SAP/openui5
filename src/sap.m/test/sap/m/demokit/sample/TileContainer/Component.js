jQuery.sap.declare("sap.m.sample.TileContainer.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.TileContainer.Component", {

	metadata : {
		rootView : "sap.m.sample.TileContainer.Page",
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
					"Page.controller.js",
					"data.json"
				]
			}
		}
	}
});