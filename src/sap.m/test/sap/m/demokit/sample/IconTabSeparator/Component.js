sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabSeparator.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.IconTabSeparator.IconTab",
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
						"IconTab.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
