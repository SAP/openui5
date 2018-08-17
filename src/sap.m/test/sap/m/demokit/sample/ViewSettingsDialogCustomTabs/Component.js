sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.ViewSettingsDialogCustomTabs.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.ViewSettingsDialogCustomTabs.V",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.layout"
				]
			},
			includes: ["style.css"],
			config: {
				sample: {
					files: [
						"style.css",
						"V.view.xml",
						"C.controller.js",
						"Dialog.fragment.xml",
						"DialogSingleCustomTab.fragment.xml"
					]
				}
			}
		}
	});
});
