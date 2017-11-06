sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.Splitter.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.layout.sample.Splitter.Splitter",
				"type": "XML",
				"async": true
			},
			includes : [
				"css/splitter.css", // This is how it should be...
				"Splitter/css/splitter.css"  // This is what works right now
			],
			dependencies : {
				libs : [
					"sap.ui.commons",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"Splitter.view.xml",
						"Splitter.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
