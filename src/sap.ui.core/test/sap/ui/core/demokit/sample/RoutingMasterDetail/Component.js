sap.ui.define( ["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.RoutingMasterDetail.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "RoutingMasterDetail.html",
					stretch : true,
					files : [
						"routingApp/controller/data.json",
						"routingApp/controller/Detail1.controller.js",
						"routingApp/controller/Detail2.controller.js",
						"routingApp/controller/Master.controller.js",
						"routingApp/view/App.view.xml",
						"routingApp/view/Detail1.view.xml",
						"routingApp/view/Detail2.view.xml",
						"routingApp/view/Master.view.xml",
						"routingApp/Component.js",
						"RoutingMasterDetail.html"
					]
				}
			}
		}

	});

}, /* bExport= */ true);

