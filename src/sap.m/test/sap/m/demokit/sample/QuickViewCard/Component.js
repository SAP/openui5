sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.QuickViewCard.Component", {

		metadata : {
			rootView : "sap.m.sample.QuickViewCard.QuickView",
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
