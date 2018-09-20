sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.matcher.BindingPath.Component", {
		metadata: {
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					iframe: "Opa.html?opaExecutionDelay=700",
					stretch: true,
					files: [
						"Opa.html",
						"Opa.js",
						"webapp/view/Main.view.xml",
						"webapp/controller/Main.controller.js",
						"webapp/index.html"
					]
				}
			}
		}
	});
});