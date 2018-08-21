sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.MessageStrip.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.MessageStrip.V",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config: {
				sample: {
					files: [
						"V.view.xml"
					]
				}
			}
		}
	});
});
