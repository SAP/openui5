sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.PanelExpanded.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.PanelExpanded.PanelExpanded",
				"type": "XML",
				"async": true
			},
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
