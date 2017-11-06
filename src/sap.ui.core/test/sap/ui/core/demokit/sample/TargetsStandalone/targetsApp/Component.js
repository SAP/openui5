sap.ui.define( ["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";
	return UIComponent.extend("sap.ui.core.sample.TargetsStandalone.targetsApp.Component", {

		metadata: {
			rootView: {
				"viewName": "sap.ui.core.sample.TargetsStandalone.targetsApp.view.App",
				"type": "XML",
				"async": true
			},
			routing: {
				config: {
					targetsClass: "sap.m.routing.Targets",
					viewPath: "sap.ui.core.sample.TargetsStandalone.targetsApp.view",
					controlId: "rootControl",
					controlAggregation: "pages",
					viewType: "XML",
					async: true
				},
				targets: {
					page1: {
						viewName: "View1",
						viewLevel: 0
					},
					page2: {
						viewName: "View2",
						viewLevel: 1
					}
				}
			}
		},

		init : function () {
			UIComponent.prototype.init.apply(this, arguments);

			// Display the initial target
			this.getTargets().display("page1");
		}

	});
}, /* bExport= */ true);
