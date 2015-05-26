sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.QuickViewSpecialCase.Component", {

		metadata : {
			rootView : "sap.m.sample.QuickViewSpecialCase.QuickView",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					stretch: true,
					files : [
						"QuickView.view.xml", "QuickView.controller.js", "QuickView.fragment.xml"
					]
				}
			}
		}
	});

	return Component;

});
