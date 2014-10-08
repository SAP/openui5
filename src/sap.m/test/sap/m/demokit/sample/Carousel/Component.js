jQuery.sap.declare("sap.m.sample.Carousel.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Carousel.Component", {

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