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
					iframe: "iStartMyUIComponent.html",
					stretch: true,
					files: [
						"iStartMyUIComponent.html",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/controller/Main.controller.js"
					]
				}
			}
		}

	});

});
