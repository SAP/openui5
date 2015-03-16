sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.Panel.Component", {

		metadata : {
			rootView : "sap.m.sample.Panel.Panel",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"Panel.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
