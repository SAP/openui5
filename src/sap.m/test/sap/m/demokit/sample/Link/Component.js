sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.Link.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.Link.LinkGroup",
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
					files : [
						"LinkGroup.view.xml",
						"LinkGroup.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
