sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TextAreaGrowing.Component", {

		metadata : {
			rootView : "sap.m.sample.TextAreaGrowing.V",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
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
