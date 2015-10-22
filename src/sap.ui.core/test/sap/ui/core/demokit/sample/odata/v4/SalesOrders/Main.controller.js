/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/Dialog',
		'sap/m/MessageBox',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function (Dialog, MessageBox, Controller, JSONModel) {
	"use strict";

	function onRejected(oError) {
		jQuery.sap.log.error(oError.message, oError.stack);
		MessageBox.alert(oError.message, {
			icon : sap.m.MessageBox.Icon.ERROR,
			title : "Error"});
	}

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrders.Main", {
		onBeforeRendering : function (oEvent) {
			var oView = this.getView();

			//TODO: if there is no data returned we got no change event -> we have to
			// attach to dataReceived event to get the view enabled again
			oView.setBusy(true);

			oView.byId("SalesOrders").getBinding("items").attachEventOnce("change",
				function () {
					oView.setBusy(false);
				}
			);
		},

		onCancelSalesOrder : function (oEvent) {
			var oCreateSalesOrderDialog = this.getView().byId("createSalesOrderDialog");

			oCreateSalesOrderDialog.close();
		},

		onCreateSalesOrderDialog : function (oEvent) {
			var oCreateSalesOrderDialog = this.getView().byId("createSalesOrderDialog");

			oCreateSalesOrderDialog.setModel(new JSONModel({}), "new");
			oCreateSalesOrderDialog.open();
		},

		onCreateSalesOrder : function (oEvent) {
			var oCreateSalesOrderDialog = this.getView().byId("createSalesOrderDialog"),
				oSalesOrderData = oCreateSalesOrderDialog.getModel("new").getObject("/"),
				that = this;

			//TODO validate oSalesOrderData according to types
			//TODO deep create incl. LOCATION etc.
			this.getView().getModel().create("/SalesOrderList", oSalesOrderData).then(
				function (oData) {
					MessageBox.alert(JSON.stringify(oData),
						{icon : sap.m.MessageBox.Icon.SUCCESS, title : "Success"});
					that.onCancelSalesOrder();
				},
				onRejected
			);
		},

		onDeleteSalesOrder : function (oEvent) {
			var oSalesOrderContext = oEvent.getSource().getBindingContext(),
				oModel = oSalesOrderContext.getModel(),
				sOrderID,
				oView = this.getView();

			function onConfirm(sCode) {
				if (sCode !== 'OK') {
					return;
				}

				oModel.remove(oSalesOrderContext).then(function () {
					MessageBox.alert("Deleted Sales Order: " + sOrderID,
						{icon : sap.m.MessageBox.Icon.SUCCESS, title : "Success"});
					oView.byId("SalesOrderLineItems").setBindingContext(undefined);
					oView.byId("SupplierContactData").setBindingContext(undefined);
				}, onRejected);
			}

			oModel.read(oSalesOrderContext.getPath() + "/SalesOrderID").then(function (oValue) {
				sOrderID = oValue.value;
				MessageBox.confirm("Do you really want to delete? " + sOrderID, onConfirm,
					"Sales Order Deletion");
				}
			);
		},

		onSalesOrdersSelect : function (oEvent) {
			var oView = this.getView(),
				oSalesOrderContext = oEvent.getParameters().listItem.getBindingContext();

			oView.byId("SalesOrderLineItems").setBindingContext(oSalesOrderContext);
			oView.byId("SupplierContactData").setBindingContext(undefined);
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			var oView = this.getView(),
				oSalesOrderLineItemContext = oEvent.getParameters().listItem.getBindingContext();

			oView.byId("SupplierContactData").setBindingContext(oSalesOrderLineItemContext);
		}
	});

});