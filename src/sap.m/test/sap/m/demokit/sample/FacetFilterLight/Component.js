sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.FacetFilterLight.Component", {

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
						"FacetFilter.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
