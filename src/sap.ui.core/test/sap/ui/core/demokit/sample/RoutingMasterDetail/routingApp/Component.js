sap.ui.define( ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/ui/Device"], function (UIComponent, JSONModel, Device) {
	"use strict";
	return UIComponent.extend("sap.ui.core.sample.RoutingMasterDetail.routingApp.Component", {

		metadata: {
			manifest: "json"
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
});
