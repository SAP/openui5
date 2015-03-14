sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ListUnread.Component", {

		metadata : {
			rootView : "sap.m.sample.ListUnread.List",
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
						"Formatter.js"
					]
				}
			}
		}
	});

	return Component;

});
