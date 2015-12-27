sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.ThemeCustomClasses.Component", {

		metadata : {
			rootView : "sap.ui.core.sample.ThemeCustomClasses.ThemeCustomClasses",
			dependencies : {
				libs : [
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					stretch : false,
					files : [
						"ThemeCustomClasses.view.xml",
						"ThemeCustomClasses.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
