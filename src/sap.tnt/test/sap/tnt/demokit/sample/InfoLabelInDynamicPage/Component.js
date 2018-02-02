sap.ui.define(["sap/ui/core/UIComponent"],
	function(UIComponent) {
	'use strict';

	var Component = UIComponent.extend("sap.tnt.sample.InfoLabelInDynamicPage.Component", {
		metadata : {
			rootView : "sap.tnt.sample.InfoLabelInDynamicPage.V",
			dependencies : {
				libs : [
					"sap.tnt",
					"sap.m",
					"sap.f",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"V.view.xml",
						"V.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
