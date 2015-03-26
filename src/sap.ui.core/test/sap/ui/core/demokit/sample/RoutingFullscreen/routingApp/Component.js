sap.ui.define( ["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";
	return UIComponent.extend("sap.ui.core.sample.RoutingFullscreen.routingApp", {

		metadata: {
			rootView: "sap.ui.core.sample.RoutingFullscreen.routingApp.view.App",
			routing: {
				config: {
					routerClass: "sap.m.routing.Router",
					viewPath: "sap.ui.core.sample.RoutingFullscreen.routingApp.view",
					controlId: "rootControl",
					controlAggregation: "pages",
					viewType: "XML"
				},
				routes: [
					{
						name: "page1",
						// empty hash - normally the start page
						pattern: "",
						target: "page1"
					},
					{
						name: "page2",
						pattern: "Page2",
						target: "page2"
					}
				],
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

			// Parse the current url and display the targets of the route that matches the hash
			this.getRouter().initialize();
		}

	});
}, /* bExport= */ true);
