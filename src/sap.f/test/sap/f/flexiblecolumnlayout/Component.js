sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/routing/Router"
], function (UIComponent, Router) {
	"use strict";

	var Component = UIComponent.extend("flexibleColumnLayout.Component", {
		metadata: {
			dependencies: {
				libs: [
					"sap.m",
					"sap.f"
				]
			},
			routing: {
				config: {
					routerClass: Router,
					viewType: "XML",
					viewPath: "flexibleColumnLayout",
					controlId: "mainApp",
					transition: "slide",
					bypassed: {

					}
				},
				routes: [
					{
						pattern: "",
						name: "page1",
						target: "page1"
					},
					{
						pattern: "fcl/:view:/:fullscreen:",
						name: "fcl",
						target: "fcl"
					},
					{
						pattern: "page2",
						name: "page2",
						target: "page2"
					},
					{
						pattern: "page3",
						name: "page3",
						target: "page3"
					}
				],
				targets: {


					fcl: {
						viewName: "FlexibleColumnLayout",
						viewLevel: 1,
						controlAggregation: "pages"
					},
					page2: {
						viewName: "Purchase order schedule line",
						viewLevel: 1,
						controlAggregation: "pages"
					}
				}
			}
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			this._router = this.getRouter();
			this._router.initialize();

			this.bus = sap.ui.getCore().getEventBus();

			this.bus.subscribe("flexible", "navigate", this.navigateToPage, this);
		},

		navigateToPage: function (sChannel, sEvent, oData) {
			this._router.navTo(oData.pageName, oData);
		},

		createContent: function () {
			// create root view
			return sap.ui.view({
				viewName: "flexibleColumnLayout.App",
				type: "XML"
			});
		}
	});
	return Component;
}, true);
