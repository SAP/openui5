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

		onDataEvents : function (oEvent) {
			var oSource = oEvent.getSource();

			jQuery.sap.log.info(oEvent.getId() + " event processed for path " + oSource.getPath(),
				oSource, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");
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

			//TODO make context public and allow access to index and value
			//   oEvent.getSource().getBindingContext().getIndex() / .requestValue("SalesOrderID")
			this.getView().byId("SalesOrders").getItems().forEach(function (oItem) {
				if (oItem.getBindingContext() === oEvent.getSource().getBindingContext()) {
					sOrderID = oItem.getCells()[0].getText();
					MessageBox.confirm("Do you really want to delete? " + sOrderID, onConfirm,
						"Sales Order Deletion");
				}
			});
		},

		onRefreshAll : function () {
			this.getView().getModel().refresh(true);
		},

		onRefreshFavoriteProduct : function (oEvent) {
			var oBinding = this.getView().byId("FavoriteProduct").getBinding("text");
			if (oBinding) {
				oBinding.refresh(true);
			}
		},

		onRefreshSalesOrderDetails : function (oEvent) {
			var oBinding = this.getView().byId("ObjectPage").getElementBinding();
			if (oBinding) {
				oBinding.refresh(true);
			}
		},

		onRefreshSalesOrdersList : function (oEvent) {
			this.getView().byId("SalesOrders").getBinding("items").refresh(true);
		},

		onSalesOrdersSelect : function (oEvent) {
			var oSalesOrderContext = oEvent.getParameters().listItem.getBindingContext(),
				oModel = oSalesOrderContext.getModel(),
				that = this,
				oView = this.getView();

			//TODO use path "" for bindElement and call setBindingContext(oSalesOrderContext) on
			//  the control; this leads to a .setContext call on the binding.
			//  This requires the binding to create a cache even for a relative path in case the
			//  binding has parameters.
			oModel.requestCanonicalPath(oSalesOrderContext).then(function (sCanonicalPath) {
				oView.byId("ObjectPage").bindElement({
					events : {
						dataReceived : that.onDataEvents.bind(that),
						dataRequested : that.onDataEvents.bind(that)
					},
					path : sCanonicalPath,
					parameters : {
						"$expand" : {
							"SO_2_SOITEM" : {
								"$expand" : {
									"SOITEM_2_PRODUCT" : {
										"$expand" : {
											"PRODUCT_2_BP" : {
												"$expand" : {
													"BP_2_CONTACT" : true
												}
											}
										}
									}
								}
							}
						},
						"$select" : ["ChangedAt", "CreatedAt" , "LifecycleStatusDesc", "Note",
							"SalesOrderID"]
					}
				});
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