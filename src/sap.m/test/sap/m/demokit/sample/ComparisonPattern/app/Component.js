sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"],
function (UIComponent, JSONModel) {
	"use strict";
	return UIComponent.extend("sap.m.sample.ComparisonPattern.app", {

		metadata: {
			rootView: {
				"viewName": "sap.m.sample.ComparisonPattern.app.view.App",
				"type": "XML",
				"async": true
			},
			routing: {
				config: {
					routerClass: "sap.m.routing.Router",
					viewPath: "sap.m.sample.ComparisonPattern.app.view",
					controlId: "rootControl",
					controlAggregation: "pages",
					viewType: "XML",
					async: true
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
						viewName: "Main",
						viewLevel: 0
					},
					page2: {
						viewName: "Comparison",
						viewLevel: 1
					}
				}
			}
		},

		init : function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.setModel(oModel);

			UIComponent.prototype.init.apply(this, arguments);

			// Parse the current url and display the targets of the route that matches the hash
			this.getRouter().initialize();

			this.aSelectedItems = [];
		}

	});
}, /* bExport= */ true);
