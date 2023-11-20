sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.layout.cssgrid.gridplayground.Component", {

		metadata : {
			"rootView": {
				"viewName": "sap.ui.layout.cssgrid.gridplayground.view.Main",
				"type": "XML",
				"async": true,
				"id": "app"
			}
		}
	});

});
