sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ListGrouping.Component", {

		metadata : {
			rootView : "sap.m.sample.ListGrouping.List",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"List.view.xml",
						"List.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
