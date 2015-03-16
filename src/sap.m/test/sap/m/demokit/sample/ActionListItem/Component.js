sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ActionListItem.Component", {

		metadata : {
			rootView : "sap.m.sample.ActionListItem.List",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"List.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
