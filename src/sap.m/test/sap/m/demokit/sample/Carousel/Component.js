sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.Carousel.Component", {

		metadata : {
			rootView : "sap.m.sample.Carousel.Carousel",
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
						"Carousel.view.xml",
						"Carousel.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
