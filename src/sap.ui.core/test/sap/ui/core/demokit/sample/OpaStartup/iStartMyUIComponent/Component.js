sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.OpaStartup.iStartMyUIComponent.Component", {

		metadata: {
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					iframe: "iStartMyUIComponent.html?opaExecutionDelay=700",
					stretch: true,
					files: [
						"iStartMyUIComponent.html",
						"iStartMyUIComponent.js",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/controller/Main.controller.js"
					]
				}
			}
		}

	});

});
