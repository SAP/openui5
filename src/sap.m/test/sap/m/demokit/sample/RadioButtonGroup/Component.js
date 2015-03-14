sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.RadioButtonGroup.Component", {

		metadata : {
			rootView : "sap.m.sample.RadioButtonGroup.V",
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
