sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.OpaStartup.iStartMyAppInAFrame.Component", {

		metadata: {
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					iframe: "iStartMyAppInAFrame.html?opaExecutionDelay=700",
					stretch: true,
					files: [
						"iStartMyAppInAFrame.html",
						"iStartMyAppInAFrame.js",
						"applicationUnderTest/index.html",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/controller/Main.controller.js",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/manifest.json"
					]
				}
			}
		}

	});

});
