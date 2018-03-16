sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.FixFlexFixedSize.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.layout.sample.FixFlexFixedSize.V",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.layout",
					"sap.m"
				]
			},
			includes : [ "FixFlexFixedSize/style.css" ],
			config : {
				sample : {
					stretch : true,
					files : [
						"V.view.xml",
						"style.css"
					]
				}
			}
		}
	});

	return Component;

});
