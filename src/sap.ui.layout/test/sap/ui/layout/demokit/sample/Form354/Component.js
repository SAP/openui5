jQuery.sap.declare("sap.ui.layout.sample.Form354.Component");

sap.ui.core.UIComponent.extend("sap.ui.layout.sample.Form354.Component", {

	metadata : {
		rootView : "sap.ui.layout.sample.Form354.Page",
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
					"Page.controller.js",
					"Change.fragment.xml",
					"Display.fragment.xml",
					"style.css"
				]
			}
		}
	}
});