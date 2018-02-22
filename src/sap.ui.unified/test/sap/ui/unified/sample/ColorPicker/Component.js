sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.ColorPicker.Component", {

		metadata : {
			rootView : "sap.ui.unified.sample.ColorPicker.View",
			dependencies : {
				libs : [
					"sap.ui.unified",
					"sap.m"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"View.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
