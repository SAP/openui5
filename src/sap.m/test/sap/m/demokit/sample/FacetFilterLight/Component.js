jQuery.sap.declare("sap.m.sample.FacetFilterLight.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.FacetFilterLight.Component", {

	metadata : {
		rootView : "sap.m.sample.FacetFilterLight.FacetFilter",
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