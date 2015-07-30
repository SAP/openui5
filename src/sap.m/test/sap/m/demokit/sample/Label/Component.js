sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.Label.Component", {

		metadata : {
			rootView : "sap.m.sample.Label.LabelGroup",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"LabelGroup.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
