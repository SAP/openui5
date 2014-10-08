jQuery.sap.declare("sap.m.sample.FacetFilterSimple.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FacetFilterSimple.Component", {

	metadata : {
		rootView : "sap.m.sample.FacetFilterSimple.FacetFilter",
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			],
			components : [
				"sap.m.sample.Table"
			]
		},
		config : {
			sample : {
				files : [
					"FacetFilter.view.xml",
					"FacetFilter.controller.js"
				]
			}
		}
	}
});