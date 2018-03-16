sap.ui.define( ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/ui/Device"], function (UIComponent, JSONModel, Device) {
	"use strict";
	return UIComponent.extend("sap.ui.core.sample.RoutingMasterDetail.routingApp", {

		metadata: {
			rootView: {
				"viewName": "sap.ui.core.sample.RoutingMasterDetail.routingApp.view.App",
				"type": "XML",
				"async": true
			},
			routing: {
				config: {
					routerClass: "sap.m.routing.Router",
					viewPath: "sap.ui.core.sample.RoutingMasterDetail.routingApp.view",
					controlId: "rootControl",
					viewType: "XML",
					async: true
				},
				routes: [
					{
						name: "master",
						// empty hash - normally the start page
						pattern: "",
						target: ["master"]
					},
					{
						name: "orderDetails",
						/*
						* display details for a specific order,
						* For example, route order/0 will display the order with orderId=0
						*/
						pattern: "orders/:orderId:",
						target: ["master", "orderDetails"]
					},
					{
						name: "productDetails",
						/*
						* display details for a specific product in a specific order
						* For example, order/0/product/1 will display the
						*    product details with productId=1 in order with orderId=0
						*/
						pattern: "orders/:orderId:/products/:productId:",
						target: ["master", "productDetails"],
					}
				],
				targets: {
					master: {
						viewName: "Master",
						controlAggregation: "masterPages",
						viewLevel: 0
					},
					orderDetails: {
						viewName: "Detail1",
						controlAggregation: "detailPages",
						title: {
							parts: ["orderName"],
							formatter: "jQuery.sap.formatMessage"
						},
						viewLevel: 1
					},
					productDetails: {
						viewName: "Detail2",
						controlAggregation: "detailPages",
						title: {
							parts: ["productName"],
							formatter: "jQuery.sap.formatMessage"
						},
						viewLevel: 2
					}
				}
			}
		},

		init : function () {

			var oModel = new JSONModel("routingApp/controller/data.json");
			this.setModel(oModel);
			this.setModel(this.createDeviceModel(), "device");

			UIComponent.prototype.init.apply(this, arguments);

			// Parse the current url and display the targets of the route that matches the hash
			this.getRouter().initialize();

			this.getRouter().attachTitleChanged(function(oEvent){
				// set the browser page title based on selected order/product
				document.title = oEvent.getParameter("title");
			});
		},
		createDeviceModel : function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	});
}, /* bExport= */ true);
