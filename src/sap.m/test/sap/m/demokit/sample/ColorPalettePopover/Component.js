sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ColorPalettePopover.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ColorPalettePopover.ColorPalettePopover",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					files : [
						"ColorPalettePopover.view.xml",
						"ColorPalettePopover.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
