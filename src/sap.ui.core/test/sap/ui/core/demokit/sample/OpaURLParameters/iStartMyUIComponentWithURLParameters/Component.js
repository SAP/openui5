sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.OpaURLParameters.iStartMyUIComponentWithURLParameters.Component", {

		metadata: {
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					iframe: "iStartMyUIComponentWithURLParameters.html?opaExecutionDelay=700",
					stretch: true,
					files: [
						"iStartMyUIComponentWithURLParameters.html",
						"iStartMyUIComponentWithURLParameters.js",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/controller/Main.controller.js"
					]
				}
			}
		}

	});

});
