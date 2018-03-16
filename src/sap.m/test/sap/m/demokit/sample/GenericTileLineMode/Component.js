sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.GenericTileLineMode.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.GenericTileLineMode.Page",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [ "sap.m" ]
			},
			includes: [ "style.css" ],
			config: {
				sample: {
					stretch: true,
					files: [ "Page.view.xml", "Page.controller.js", "style.css", "tiles.json" ]
				}
			}
		}
	});
	return Component;
});
