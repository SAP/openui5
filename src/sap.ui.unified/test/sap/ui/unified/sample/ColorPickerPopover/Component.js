sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.ColorPickerPopover.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.ColorPickerPopover.ColorPickerPopover",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.unified"
				]
			},
			config : {
				sample : {
					files : [
						"ColorPickerPopover.view.xml",
						"ColorPickerPopover.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
