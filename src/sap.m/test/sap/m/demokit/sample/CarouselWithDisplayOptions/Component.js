sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.CarouselWithDisplayOptions.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.CarouselWithDisplayOptions.Carousel",
				"type": "XML",
				"async": true
			},
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
