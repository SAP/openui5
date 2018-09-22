sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.OpaURLParameters.iStartMyAppInAFrameWithURLParameters.Component", {

		metadata: {
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					iframe: "iStartMyAppInAFrameWithURLParameters.html?opaExecutionDelay=700",
					stretch: true,
					files: [
						"iStartMyAppInAFrameWithURLParameters.html",
						"iStartMyAppInAFrameWithURLParameters.js",
						"applicationUnderTest/index.html",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/controller/Main.controller.js"
					]
				}
			}
		}

	});

});
