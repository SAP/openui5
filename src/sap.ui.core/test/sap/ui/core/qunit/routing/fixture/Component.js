sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("test.routing.target.Component", {

		metadata : {
			rootView : {
				"viewName": "test.routing.target.Async1",
				"type": "XML",
				"async": true
			}
		}
	});

	return Component;
});