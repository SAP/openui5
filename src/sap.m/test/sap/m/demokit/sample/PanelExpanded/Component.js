sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.PanelExpanded.Component", {

		metadata : {
			rootView : "sap.m.sample.PanelExpanded.PanelExpanded",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"PanelExpanded.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
