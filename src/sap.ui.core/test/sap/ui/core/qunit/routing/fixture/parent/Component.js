sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/Panel"
], function (UIComponent, Panel) {
	"use strict";

	var Component = UIComponent.extend("test.routing.target.parent.Component", {
		metadata : {
			rootView : {
				"viewName": "test.routing.target.Async2",
				"type": "XML",
				"async": true
			}
		}
	});

	return Component;
});
