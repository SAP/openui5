sap.ui.define( ["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.TargetsStandalone.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "TargetsStandalone.html",
					stretch : true,
					files : [
						"targetsApp/Component.js",
						"targetsApp/view/View1.view.xml",
						"targetsApp/controller/View1.controller.js",
						"targetsApp/view/View2.view.xml",
						"targetsApp/controller/View2.controller.js",
						"targetsApp/view/App.view.xml",
						"TargetsStandalone.html"
					]
				}
			}
		}

	});

}, /* bExport= */ true);

