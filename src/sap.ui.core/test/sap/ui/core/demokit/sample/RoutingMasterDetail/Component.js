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
						"routingApp/Component.js",
						"routingApp/view/Master.view.xml",
						"routingApp/view/Detail1.view.xml",
						"routingApp/controller/Detail1.controller.js",
						"routingApp/view/Detail2.view.xml",
						"routingApp/controller/Detail2.controller.js",
						"routingApp/view/App.view.xml",
						"RoutingMasterDetail.html"
					]
				}
			}
		}

	});

}, /* bExport= */ true);

