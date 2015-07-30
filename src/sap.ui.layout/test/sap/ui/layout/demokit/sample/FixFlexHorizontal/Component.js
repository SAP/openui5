sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.FixFlexHorizontal.Component", {

		metadata : {
			rootView : "sap.ui.layout.sample.FixFlexHorizontal.V",
			dependencies : {
				libs : [
				    "sap.ui.layout",
					"sap.m"
				]
			},
			includes : [ "FixFlexHorizontal/style.css" ],
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
