/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/Dialog',
		'sap/m/MessageBox',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/Item',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function (Dialog, MessageBox, DateFormat, Item, Controller, JSONModel) {
	"use strict";

	var oDateFormat = DateFormat.getTimeInstance({pattern : "HH:mm"});

	function onRejected(oError) {
		jQuery.sap.log.error(oError.message, oError.stack);
		MessageBox.alert(oError.message, {
			icon : MessageBox.Icon.ERROR,
			title : "Error"});
	}

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrders.Main", {
		onCancelSalesOrder : function (oEvent) {
			var oCreateSalesOrderDialog = this.getView().byId("createSalesOrderDialog");

			oCreateSalesOrderDialog.close();
		},

		onCreateSalesOrderDialog : function (oEvent) {
			var oView = this.getView(),
				oBuyerIdInput = oView.byId("BuyerID"),
				oCreateSalesOrderDialog = oView.byId("createSalesOrderDialog");

			oCreateSalesOrderDialog.setModel(new JSONModel({}), "new");
			if (!oBuyerIdInput.getBinding("suggestionItems")) {
				oBuyerIdInput.bindAggregation("suggestionItems", {
					path : '/BusinessPartnerList',
					parameters : {'$$groupId' : '$direct'},
					template : new Item({text : "{BusinessPartnerID}"})
				});
			}
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
						{icon : MessageBox.Icon.SUCCESS, title : "Success"});
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
						{icon : MessageBox.Icon.SUCCESS, title : "Success"});
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
			this.getView().byId("FavoriteProduct").getBinding("value").refresh(true);
		},

		onRefreshSalesOrderDetails : function (oEvent) {
			this.getView().byId("ObjectPage").getElementBinding().refresh(true);
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
							},
							"SO_2_BP" : {
								"$select" : ["BusinessPartnerID", "CompanyName", "PhoneNumber"]
							}
						},
						"$select" : ["ChangedAt", "CreatedAt" , "LifecycleStatusDesc", "Note",
							"SalesOrderID"],
						"$$updateGroupId" : "SalesOrderUpdateGroup"
					}
				});
				oView.byId("SupplierDetailsForm").unbindObject();
				oView.byId("SupplierContactData").setBindingContext(undefined);
			});
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			var oView = this.getView(),
				oSalesOrderLineItemContext = oEvent.getParameters().listItem.getBindingContext(),
				oSupplierDetailsForm = this.getView().byId("SupplierDetailsForm");

			oView.byId("SupplierContactData").setBindingContext(oSalesOrderLineItemContext);

			//TODO the following does not work because requestCanonicalPath() fails later on, when
			//     the PATCH request is sent, because ProductList has no NavigationPropertyBindings
//			oSupplierDetailsForm.setBindingContext(oSalesOrderLineItemContext);

			// workaround: manual computation of canonical URL for the time being
			oSalesOrderLineItemContext
				.requestValue("SOITEM_2_PRODUCT/PRODUCT_2_BP/BusinessPartnerID")
				.then(function (sBusinessPartnerID) {
					//TODO _Helper.formatLiteral
					oSupplierDetailsForm.bindObject(
						"/BusinessPartnerList('" + sBusinessPartnerID + "')");
				});
		},

		onSaveSalesOrder : function () {
			this.getView().getModel().submitBatch("SalesOrderUpdateGroup");
		},

		onSaveSalesOrderList : function () {
			this.getView().getModel().submitBatch("SalesOrderListUpdateGroup");
		},

		/**
		 * Update the favorite product's name by replacing it with the current time (hour/minute).
		 * This shows a somehow useful update, you should be able to see changes on the UI quite
		 * frequently, but not too many backend requests.
		 */
		onUpdateFavoriteProduct : function (/*oEvent*/) {
			var oBinding = this.getView().byId("FavoriteProduct").getBinding("value");

			oBinding.setValue(oDateFormat.format(new Date()));
		}
	});

});