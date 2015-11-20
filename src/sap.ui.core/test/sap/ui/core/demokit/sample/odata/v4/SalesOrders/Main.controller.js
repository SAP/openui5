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
			var oSalesOrderContext = oEvent.getParameters().listItem.getBindingContext(),
				oModel = oSalesOrderContext.getModel(),
				oView = this.getView();

			oModel.read(oSalesOrderContext.getPath() + "/SalesOrderID").then(function (oValue) {
				// /SalesOrderList('050001110')
				oView.byId("SalesOrderForm").bindElement({
					//TODO path computation should be possible via API like requestCanonicalUrl
					path : "/SalesOrderList('" + oValue.value + "')",
					parameters: {
						"$expand" : "SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP"
							+ "($expand=BP_2_CONTACT)))"
					}
				});
				oView.byId("SalesOrderLineItems").setBindingContext(
					oView.byId("SalesOrderForm").getElementBinding().getContext());
				oView.byId("SupplierContactData").setBindingContext(undefined);
			});
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			var oView = this.getView(),
				oSalesOrderLineItemContext = oEvent.getParameters().listItem.getBindingContext();

			oView.byId("SupplierContactData").setBindingContext(oSalesOrderLineItemContext);
		}
	});

});