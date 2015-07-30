sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.FlexBoxCols.Component", {

		metadata : {
			rootView : "sap.m.sample.FlexBoxCols.V",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			includes : [ "FlexBoxCols/style.css" ],
			config : {
				sample : {
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
