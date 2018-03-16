sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TreeDnD.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.TreeDnD.Page",
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
						"Page.view.xml",
						"Page.controller.js",
						"Tree.json"
					]
				}
			}
		}
	});

	return Component;

});
