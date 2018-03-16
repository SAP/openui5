sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.SegmentedButtonLI.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.SegmentedButtonLI.List",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					files : [
						"List.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
