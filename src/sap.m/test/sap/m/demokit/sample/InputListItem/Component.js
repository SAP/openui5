sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.InputListItem.Component", {

		metadata : {
			rootView : "sap.m.sample.InputListItem.List",
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
