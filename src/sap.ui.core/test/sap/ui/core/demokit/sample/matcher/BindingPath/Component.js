sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.matcher.BindingPath.Component", {

		metadata: {
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					iframe: "BindingPath.html",
					stretch: true,
					files: [
						"BindingPath.html",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/controller/Main.controller.js",
						"applicationUnderTest/index.html"
					]
				}
			}
		}

	});

	return Component;

});
