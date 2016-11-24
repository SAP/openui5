sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
	"use strict";

	var Component = UIComponent.extend("flexiblecolumnlayout.Component", {
		metadata: {
			dependencies: {
				libs: [
					"sap.m",
					"sap.f"
				]
			},
			routing: {
				config: {
					async: true,
					routerClass: "sap.f.routing.Router",
					viewType: "XML",
					viewPath: "flexiblecolumnlayout",
					controlId: "fcl",
					transition: "slide",
					bypassed: {

					}
				},
				routes: [
					{
						pattern: "",
						name: "master",
						target: "master",
						showMidColumn: false,
						showEndColumn: false,
						fullScreenColumn: "None"
					},
					{
						pattern: "detail/:fs:",
						name: "detail",
						target: ["master","detail"],
						showMidColumn: true,
						showEndColumn: false
					},
					{
						pattern: "detailDetail/:fs:",
						name: "detailDetail",
						target: ["master", "detail", "detailDetail"],
						showMidColumn: true,
						showEndColumn: true
					},
					{
						pattern: "page2",
						name: "page2",
						target: "page2",
						fullScreenColumn: "End"
					},
					{
						pattern: "page3",
						name: "page3",
						target: "page3",
						fullScreenColumn: "End"
					}
				],
				targets: {
					master: {
						viewName: "Master",
						controlAggregation: "beginColumnPages"
					},
					detail: {
						viewName: "Detail",
						controlAggregation: "midColumnPages"
					},
					detailDetail: {
						viewName: "DetailDetail",
						controlAggregation: "endColumnPages"
					},
					page2: {
						viewName: "Page2",
						controlAggregation: "endColumnPages"
					},
					page3: {
						viewName: "Page3",
						controlAggregation: "endColumnPages"
					}
				}
			}
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);

			var oData = {
				fullScreenColumn: "None",
				detail: {
					fullScreenButton: {
						icon: "sap-icon://full-screen",
						visible: false
					},
					closeButton: {
						visible: false
					}
				},
				detailDetail: {
					fullScreenButton: {
						icon: "sap-icon://full-screen",
						visible: false
					},
					closeButton: {
						visible: false
					}
				}
			};

			var oModel = new JSONModel(oData);
			this.setModel(oModel);

			this.getRouter().initialize();
		},

		createContent: function () {
			// create root view
			return sap.ui.view({
				viewName: "flexiblecolumnlayout.FlexibleColumnLayout",
				type: "XML"
			});
		},

		isFullScreen: function () {
			return this.getModel().getProperty("/fullScreenColumn") !== "None";
		}
	});
	return Component;
}, true);
