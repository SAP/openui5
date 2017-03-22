sap.ui.define(['sap/ui/core/UIComponent'],
function(UIComponent) {
	"use strict";

	return UIComponent.extend("appUnderTest.Component", {

		metadata: {
			"rootView": "appUnderTest.view.Main",
			"dependencies": {
				"libs": {
					"sap.ui.core": {},
					"sap.m": {},
					"sap.ui.layout": {}
				}
			}

		}

	});

});
