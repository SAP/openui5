sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.BusyIndicator.Component", {

		metadata : {
			rootView : "sap.m.sample.BusyIndicator.V",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"V.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
