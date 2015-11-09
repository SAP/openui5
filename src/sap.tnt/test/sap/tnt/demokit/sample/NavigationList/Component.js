sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.tnt.sample.NavigationList.Component", {

		metadata : {
			rootView : "sap.tnt.sample.NavigationList.NavigationList",
			dependencies : {
				libs : [
					"sap.m",
					"sap.tnt",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					stretch: true,
					files : [
						"NavigationList.view.xml", "NavigationList.controller.js", "NavigationList.fragment.xml"
					]
				}
			}
		}
	});

	return Component;

});
