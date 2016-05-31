/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/Dialog',
		'sap/m/MessageBox',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/Item',
		'sap/ui/core/mvc/Controller',
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		'sap/ui/model/json/JSONModel'
], function (Dialog, MessageBox, DateFormat, Item, Controller, Filter, FilterOperator, JSONModel) {
	"use strict";

	var oDateFormat = DateFormat.getTimeInstance({pattern : "HH:mm"});

//	function onRejected(oError) {
//		jQuery.sap.log.error(oError.message, oError.stack);
//		MessageBox.alert(oError.message, {
//			icon : MessageBox.Icon.ERROR,
//			title : "Error"});
//	}

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrders.Main", {
		onCancelSalesOrder : function (oEvent) {
			this.getView().getModel().resetChanges("SalesOrderUpdateGroup");
		},

		onCancelSalesOrderCreate : function (oEvent) {
			var oCreateSalesOrderDialog = this.getView().byId("createSalesOrderDialog");

			oCreateSalesOrderDialog.close();
		},

		onCancelSalesOrderList : function (oEvent) {
			this.getView().getModel().resetChanges("SalesOrderListUpdateGroup");
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
//			var oCreateSalesOrderDialog = this.getView().byId("createSalesOrderDialog"),
//				oSalesOrderData = oCreateSalesOrderDialog.getModel("new").getObject("/"),
//				that = this;

			//TODO validate oSalesOrderData according to types
			//TODO deep create incl. LOCATION etc.
//				TODO the code will be needed when "create" is implemented
//				MessageBox.alert(JSON.stringify(oData),
//					{icon : MessageBox.Icon.SUCCESS, title : "Success"});
//				that.onCancelSalesOrder();
		},

		onDataEvents : function (oEvent) {
			var aSalesOrderIDs = [],
				oSource = oEvent.getSource();

			jQuery.sap.log.info(oEvent.getId() + " event processed for path " + oSource.getPath(),
				oSource, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");

			if (oEvent.getId() === "dataReceived") {
				if (oSource.getPath() === "/SalesOrderList") {
					oSource.getCurrentContexts().forEach(function (oContext) {
						aSalesOrderIDs.push(oContext.getProperty("SalesOrderID"));
					});
					jQuery.sap.log.info("Current SalesOrderIDs: " + aSalesOrderIDs.join(", "),
						null, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");
				} else if (oSource.getPath() === "/ProductList('HT-1000')/Name") {
					jQuery.sap.log.info("Favorite Product ID: " + oSource.getValue(),
						null, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");
				} else if (/^\/SalesOrderList\(.*\)/.test(oSource.getPath())) {
					jQuery.sap.log.info("Current Sales Order: "
						+ oSource.getBoundContext().getProperty("SalesOrderID"),
						null, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");
				}
			}
		},

		onDeleteSalesOrder : function (oEvent) {
			var oSalesOrderContext = oEvent.getSource().getBindingContext(),
				// oModel = oSalesOrderContext.getModel(),
				sMessage,
				sOrderID;
				// oView = this.getView();

			function onConfirm(sCode) {
				if (sCode !== 'OK') {
					return;
				}
				MessageBox.alert("Not yet implemented");
//					TODO the code will be needed when "remove" is implemented
//					MessageBox.alert("Deleted Sales Order: " + sOrderID,
//						{icon : MessageBox.Icon.SUCCESS, title : "Success"});
//					oView.byId("SalesOrderLineItems").setBindingContext(undefined);
//					oView.byId("SupplierContactData").setBindingContext(undefined);
			}
			sOrderID = oSalesOrderContext.getProperty("SalesOrderID", true);
			sMessage = "Do you really want to delete: " + sOrderID
				+ ", Gross Amount: " + oSalesOrderContext.getProperty("GrossAmount", true)
				+ " " + oSalesOrderContext.getProperty("CurrencyCode", true) + "?";
			MessageBox.confirm(sMessage, onConfirm, "Sales Order Deletion");
		},

		onInit : function () {
			var bMessageOpen = false,
				oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageModel = oMessageManager.getMessageModel();

			this.oMessageModelBinding = oMessageModel.bindList("/", undefined,
				[], new Filter("technical", FilterOperator.EQ, true));

			this.oMessageModelBinding.attachChange(function (oEvent) {
				var aContexts = oEvent.getSource().getContexts(),
					aMessages = [],
					sPrefix;

				if (bMessageOpen || !aContexts.length) {
					return;
				}

				// Extract and remove the technical messages
				aContexts.forEach(function (oContext) {
					aMessages.push(oContext.getObject());
				});
				oMessageManager.removeMessages(aMessages);

				// Due to batching there can be more than one technical message. However the UX
				// guidelines say "display a single message in a message box" assuming that there
				// will be only one at a time.
				sPrefix = aMessages.length === 1 ? ""
					: "There have been multiple technical errors. One example: ";
				MessageBox.error(sPrefix + aMessages[0].message, {
					id : "serviceErrorMessageBox",
					onClose: function () {
						bMessageOpen = false;
					}
				});
				bMessageOpen = true;
			});
		},

		onRefresh : function (oRefreshable, sMessage) {
			if (oRefreshable.hasPendingChanges()) {
				MessageBox.confirm(sMessage, function onConfirm(sCode) {
					if (sCode === "OK") {
						oRefreshable.refresh();
					}
				}, "Refresh");
			} else {
				oRefreshable.refresh();
			}
		},

		onRefreshAll : function () {
			this.onRefresh(this.getView().getModel(),
				"There are pending changes. Do you really want to refresh everything?");
		},

		onRefreshFavoriteProduct : function (oEvent) {
			this.onRefresh(this.getView().byId("FavoriteProduct").getBinding("value"),
				"There are pending changes. Do you really want to refresh the favorite product?");
		},

		onRefreshSalesOrderDetails : function (oEvent) {
			this.onRefresh(this.getView().byId("ObjectPage").getElementBinding(),
				"There are pending changes. Do you really want to refresh the sales order?");
		},

		onRefreshSalesOrdersList : function (oEvent) {
			this.onRefresh(this.getView().byId("SalesOrders").getBinding("items"),
				"There are pending changes. Do you really want to refresh all sales orders?");
		},

		onSalesOrdersSelect : function (oEvent) {
			var oSalesOrderContext = oEvent.getParameters().listItem.getBindingContext(),
				oView = this.getView();

			oView.byId("ObjectPage").setBindingContext(oSalesOrderContext);
			oView.byId("SupplierDetailsForm").unbindObject();
			oView.byId("SupplierContactData").setBindingContext(undefined);
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
			//TODO _Helper.formatLiteral
			oSupplierDetailsForm.bindObject("/BusinessPartnerList('"
				+ oSalesOrderLineItemContext.getProperty(
					"SOITEM_2_PRODUCT/PRODUCT_2_BP/BusinessPartnerID")
				+ "')");
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
		},

		produceTechnicalError : function () {
			var oViewElement = this.getView().byId("FavoriteProduct");

			oViewElement.bindProperty("value", {path : "/ProductList('HT-1000')/Unknown"});
		}
	});

});