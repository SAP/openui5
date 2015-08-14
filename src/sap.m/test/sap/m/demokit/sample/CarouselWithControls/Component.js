sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.CarouselWithControls.Component", {

		metadata : {
			rootView : "sap.m.sample.CarouselWithControls.Carousel",
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
