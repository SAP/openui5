sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.FeedListItem.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.FeedListItem.List",
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
						"List.view.xml",
						"List.controller.js",
						"feed.json"
					]
				}
			}
		}
	});

	return Component;

});
