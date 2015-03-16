sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.FlexBoxSizeAdjustments.Component", {

		metadata : {
			rootView : "sap.m.sample.FlexBoxSizeAdjustments.V",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			includes : [ "FlexBoxSizeAdjustments/style.css" ],
			config : {
				sample : {
					files : [
						"V.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
