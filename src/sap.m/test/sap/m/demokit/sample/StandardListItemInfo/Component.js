sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.StandardListItemInfo.Component", {

		metadata : {
			rootView : "sap.m.sample.StandardListItemInfo.List",
			dependencies : {
				libs : [
					"sap.m"
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
