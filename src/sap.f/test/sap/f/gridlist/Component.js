sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.f.gridlist.Component", {

		metadata : {
			"rootView": {
				"viewName": "sap.f.gridlist.view.Main",
				"type": "XML",
				"async": true,
				"id": "app"
			}
		}
	});

});
