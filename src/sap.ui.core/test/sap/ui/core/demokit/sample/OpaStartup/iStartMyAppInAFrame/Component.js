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
					iframe: "iStartMyAppInAFrame.html",
					stretch: true,
					files: [
						"iStartMyAppInAFrame.html",
						"applicationUnderTest/index.html",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/controller/Main.controller.js"
					]
				}
			}
		}

	});

});
