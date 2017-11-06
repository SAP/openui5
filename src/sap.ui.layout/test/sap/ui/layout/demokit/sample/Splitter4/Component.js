sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.Splitter4.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.layout.sample.Splitter4.Splitter",
				"type": "XML",
				"async": true
			},
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
