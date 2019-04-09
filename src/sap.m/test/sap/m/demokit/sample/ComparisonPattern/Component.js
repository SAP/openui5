sap.ui.define( ["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.ComparisonPattern.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "ComparisonPattern.html",
					stretch : true,
					files : [
						"app/Component.js",
						"app/view/Main.view.xml",
						"app/controller/Main.controller.js",
						"app/view/Comparison.view.xml",
						"app/controller/Comparison.controller.js",
						"app/view/App.view.xml",
						"app/view/App.view.xml",
						"ComparisonPattern.html"
					]
				}
			}
		}

	});

}, /* bExport= */ true);

