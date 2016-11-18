sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabFilterCustomization.Component", {

		metadata : {
			rootView : "sap.m.sample.IconTabFilterCustomization.IconTabFilterCustomization",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			includes : [ "CustomIconTabFilter.css" ],
			config : {
				sample : {
					files : [
						"CustomIconTabFilter.js",
						"IconTabFilterCustomization.view.xml",
						"IconTabFilterCustomization.controller.js",
						"CustomIconTabFilter.css"
					]
				}
			}
		}
	});

	return Component;

});
