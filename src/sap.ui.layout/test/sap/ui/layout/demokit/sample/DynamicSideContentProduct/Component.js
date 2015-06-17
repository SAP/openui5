sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.DynamicSideContentProduct.Component", {

		metadata : {
			rootView : "sap.ui.layout.sample.DynamicSideContentProduct.DynamicSideContent",
			dependencies : {
				libs : [
					"sap.ui.layout"
				]
			},
			includes : [ "style.css" ],
			config : {
				sample : {
					stretch : true,
					files : [
						"DynamicSideContent.view.xml",
						"DynamicSideContent.controller.js",
						"style.css"
					]
				}
			}
		}
	});

	return Component;

});
