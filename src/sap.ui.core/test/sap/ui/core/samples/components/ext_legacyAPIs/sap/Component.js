sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("samples.components.ext_legacyAPIs.sap.Component", {

		metadata : {
			version : "1.0",
			rootView : {
				viewName: "samples.components.ext_legacyAPIs.sap.Main",
				type: "XML",
				async: true
			},
			config : {
				"myConfig": {
					"key1": "value1"
				}
			}
		}

	});

	return Component;
});
