sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabSeparator.Component", {

		metadata : {
			rootView : "sap.m.sample.IconTabSeparator.IconTab",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"IconTab.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
