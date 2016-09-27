/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/m/Dialog',
		'sap/m/MessageBox',
		'sap/m/MessageToast',
		'sap/ui/core/format/DateFormat',
		'sap/ui/core/Item',
		'sap/ui/core/mvc/Controller',
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		'sap/ui/model/json/JSONModel'
], function (Dialog, MessageBox, MessageToast, DateFormat, Item, Controller, Filter, FilterOperator,
		JSONModel) {
	"use strict";

	var oDateFormat = DateFormat.getTimeInstance({pattern : "HH:mm"}),
		sServiceNamespace = "com.sap.gateway.default.iwbep.v4_gw_sample_basic.v0001.";

//	function onRejected(oError) {
//		jQuery.sap.log.error(oError.message, oError.stack);
//		MessageBox.alert(oError.message, {
//			icon : MessageBox.Icon.ERROR,
//			title : "Error"});
//	}

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrders.Main", {
		_setSalesOrderBindingContext : function (oSalesOrderContext) {
			var oView = this.getView(),
				oSalesOrdersTable = oView.byId("SalesOrders"),
				oUIModel = oView.getModel("ui");

			oUIModel.setProperty("/bSalesOrderSelected", !!oSalesOrderContext);
			oUIModel.setProperty("/bSelectedSalesOrderTransient",
				oSalesOrderContext && oSalesOrderContext.isTransient());

			if (!oSalesOrderContext) {
				oSalesOrdersTable.removeSelections();
			} else if (oSalesOrderContext.isTransient()) {
				// TODO: eliminate this workaround:
				// to ensure that no dependent data for the newly created SO is fetched
				// unless it is persisted in backend
				oSalesOrderContext = undefined;
				oSalesOrdersTable.setSelectedItem(oSalesOrdersTable.getItems()[0]);
			}
			oView.byId("ObjectPage").setBindingContext(oSalesOrderContext);

			oUIModel.setProperty("/bLineItemSelected", false);
			oView.byId("SupplierContactData").setBindingContext(undefined);
			oView.byId("SupplierDetailsForm").setBindingContext(undefined);
		},

		onCancelSalesOrder : function (oEvent) {
			this.getView().getModel().resetChanges("SalesOrderUpdateGroup");
		},

		onCancelSalesOrderSchedules : function (oEvent) {
			this.getView().byId("SalesOrderSchedulesDialog").close();
		},

		onCancelSalesOrderList : function (oEvent) {
			this.getView().getModel().resetChanges("SalesOrderListUpdateGroup");
		},

		onConfirmSalesOrder : function () {
			var oModel = this.getView().getModel(),
				oTable = this.getView().byId("SalesOrders"),
				oSalesOrderContext = oTable.getSelectedItem().getBindingContext(),
				oAction = oModel.bindContext(sServiceNamespace + "SalesOrder_Confirm(...)",
					oSalesOrderContext),
				that = this;

			oAction.execute().then(
				function () {
					MessageToast.show("Sales order "
						+ oSalesOrderContext.getProperty("SalesOrderID") + " confirmed");
					that.refresh(that.getView().byId("SalesOrders").getBinding("items"),
						"all sales orders");
				},
				function (oError) {
					MessageBox.alert(oError.message, {
						icon : MessageBox.Icon.ERROR,
						title : "Error"});
				}
			);
		},

		onCloseSalesOrderDialog : function (oEvent) {
			this.getView().byId("CreateSalesOrderDialog").close();
		},

		onCreateSalesOrder : function (oEvent) {
			var oView = this.getView(),
				oContext = oView.byId("SalesOrders").getBinding("items")
					.create(undefined, {
						// TODO where to get initial values from to avoid "failed to drill-down"
						// and "Not all properties provided while creation or update was executed."
						// $select?
						"SalesOrderID" : "",
						"Note" : new Date().toString(),
						"NoteLanguage" : "E",
						"BuyerID" : "0100000000",
						"BuyerName" : "",
						"CurrencyCode" : "EUR",
						"GrossAmount" : "0.00",
						"NetAmount" : "0.00",
						"TaxAmount" : "0.00",
						"LifecycleStatus" : "N",
						"LifecycleStatusDesc" : "New",
						"BillingStatus" : "",
						"BillingStatusDesc" : "",
						"DeliveryStatus" : "",
						"DeliveryStatusDesc" : "",
						"CreatedAt" : "",
						"ChangedAt" : "",
						"SOItemCount" : 0,
						"SO_2_BP" : null
					}),
				oCreateSalesOrderDialog = oView.byId("CreateSalesOrderDialog"),
				that = this;

			oView.getModel("ui").setProperty("/bCreateSalesOrderPending", true);

			oCreateSalesOrderDialog.setBindingContext(oContext);
			this._setSalesOrderBindingContext(oContext);

			oCreateSalesOrderDialog.open();

			// Note: this promise fails only if the transient entity is deleted
			oContext.created().then(function () {
				that._setSalesOrderBindingContext(oContext);
				oView.getModel("ui").setProperty("/bCreateSalesOrderPending", false);
				MessageBox.alert("SalesOrder created: " + oContext.getProperty("SalesOrderID"), {
					icon : MessageBox.Icon.SUCCESS,
					title : "Success"
				});
			}, function (oError) {
				// TODO:
				// As for now create cancelation AND backend errors both result in
				// a rejected created Promise; differentiation is possible with the canceled flag.
				// Later on only cancelation is rejected, backend errors will be passed to the
				// message manager and the POST request will be sent again after new user input
				if (oError.canceled) {
					oView.getModel("ui").setProperty("/bCreateSalesOrderPending", false);
					return; // delete of transient entity
				}
				MessageBox.alert(oError.message, {
					icon : MessageBox.Icon.ERROR,
					title : "Unexpected Error"
				});
			});
		},

		onDataEvents : function (oEvent) {
			var aSalesOrderIDs = [],
				oSource = oEvent.getSource();

			jQuery.sap.log.info(oEvent.getId() + " event processed for path " + oSource.getPath(),
				oSource, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");

			if (oEvent.getId() === "dataReceived") {
				if (oSource.getPath() === "/SalesOrderList") {
					oSource.getCurrentContexts().forEach(function (oContext) {
						aSalesOrderIDs.push(oContext && oContext.getProperty("SalesOrderID"));
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

		onDeleteBusinessPartner: function () {
			var oContext = this.getView().byId("BusinessPartner").getBindingContext();

			oContext["delete"](oContext.getModel().getUpdateGroupId()).then(function () {
				MessageBox.alert("Deleted Business Partner",
					{icon : MessageBox.Icon.SUCCESS, title : "Success"});
			}, function (oError) {
				MessageBox.alert("Could not delete Business Partner: " + oError.message,
					{icon : MessageBox.Icon.ERROR, title : "Error"});
			});
		},

		onDeleteSalesOrder : function () {
			var sMessage,
				sOrderID,
				oTable = this.getView().byId("SalesOrders"),
				oSalesOrderContext = oTable.getSelectedItem().getBindingContext(),
				that = this;

			function onConfirm(sCode) {
				if (sCode !== 'OK') {
					return;
				}
				// Use "$auto" or "$direct" just like selected when creating the model
				oSalesOrderContext["delete"](oSalesOrderContext.getModel().getUpdateGroupId())
					.then(function () {
						that._setSalesOrderBindingContext();
						MessageBox.alert("Deleted Sales Order " + sOrderID,
							{icon : MessageBox.Icon.SUCCESS, title : "Success"});
					}, function (oError) {
						MessageBox.alert("Could not delete Sales Order " + sOrderID + ": "
							+ oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
					});
			}

			sOrderID = oSalesOrderContext.getProperty("SalesOrderID", true);
			sMessage = "Do you really want to delete: " + sOrderID
				+ ", Gross Amount: " + oSalesOrderContext.getProperty("GrossAmount", true)
				+ " " + oSalesOrderContext.getProperty("CurrencyCode", true) + "?";
			MessageBox.confirm(sMessage, onConfirm, "Sales Order Deletion");
		},

		onDeleteSalesOrderSchedules : function (oEvent) {
			var oView = this.getView(),
				sGroupId = oView.getModel().getUpdateGroupId(),
				aPromises = [],
				oTable = oView.byId("SalesOrderSchedules");

			// Special case: Delete entities deeply nested in the cache
			oTable.getSelectedContexts().forEach(function (oContext) {
				aPromises.push(oContext["delete"](sGroupId));
			});
			Promise.all(aPromises).then(function () {
				oTable.removeSelections();
				oView.getModel("ui").setProperty("/bScheduleSelected", false);
				MessageBox.alert("Deleted " + aPromises.length + " Sales Order Schedule(s)",
					{icon : MessageBox.Icon.SUCCESS, title : "Success"});
			}, function (oError) {
				MessageBox.alert("Could not delete a Sales Order Schedule: "
					+ oError.message, {icon : MessageBox.Icon.ERROR, title : "Error"});
			});
		},

		onFilter : function (oEvent) {
			var oView = this.getView(),
				oBinding = oView.byId("SalesOrders").getBinding("items"),
				sQuery = oView.getModel("ui").getProperty("/filterValue"); // TODO validation

			if (oBinding.hasPendingChanges()) {
				MessageBox.error("Cannot filter due to unsaved changes"
					+ "; save or reset changes before filtering");
				return;
			}
			oBinding.filter(sQuery
				? new Filter("GrossAmount", FilterOperator.GT, sQuery)
				: null);
			this._setSalesOrderBindingContext();
		},

		onFilterItems : function (oEvent) {
			var oView = this.getView(),
				oBinding = oView.byId("SalesOrderLineItems").getBinding("items"),
				sQuery = oView.getModel("ui").getProperty("/filterProductID");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error("Cannot filter due to unsaved changes"
					+ "; save or reset changes before filtering");
				return;
			}
			oBinding.filter(sQuery
				? new Filter("Product/ProductID", FilterOperator.EQ, sQuery)
				: null);
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

		onRefreshAll : function () {
			var oModel = this.getView().getModel();

			this.refresh(oModel, "everything",
				["SalesOrderListUpdateGroup", "SalesOrderUpdateGroup"]);
		},

		onRefreshFavoriteProduct : function (oEvent) {
			this.refresh(this.getView().byId("FavoriteProduct").getBinding("value"),
				"the favorite product");
		},

//		onRefreshSalesOrderDetails : function (oEvent) {
//			this.refresh(this.getView().byId("ObjectPage").getElementBinding(),
//				"the sales order");
//		},

		onRefreshSalesOrdersList : function (oEvent) {
			this.refresh(this.getView().byId("SalesOrders").getBinding("items"),
				"all sales orders");
		},

		onSalesOrderSchedules : function (oEvent) {
			var oView = this.getView();

			oView.byId("SalesOrderSchedules").removeSelections();
			oView.getModel("ui").setProperty("/bScheduleSelected", false);
			oView.byId("SalesOrderSchedulesDialog").open();
		},

		onSalesOrdersSelect : function (oEvent) {
			this._setSalesOrderBindingContext(oEvent.getParameters().listItem.getBindingContext());
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			var oView = this.getView(),
				oSalesOrderLineItemContext = oEvent.getParameters().listItem.getBindingContext();

			oView.byId("SupplierContactData").setBindingContext(oSalesOrderLineItemContext);
			oView.byId("SupplierDetailsForm").setBindingContext(oSalesOrderLineItemContext);
			oView.getModel("ui").setProperty("/bLineItemSelected", true);
		},

		onSalesOrderScheduleSelect : function (oEvent) {
			var oView = this.getView();

			oView.getModel("ui").setProperty("/bScheduleSelected",
				oView.byId("SalesOrderSchedules").getSelectedContexts().length > 0);
		},

		onSaveSalesOrder : function () {
			this.getView().getModel().submitBatch("SalesOrderUpdateGroup");
		},

		onSaveSalesOrderSchedules : function () {
			var oView = this.getView();

			oView.getModel().submitBatch("SalesOrderUpdateGroup");
			oView.byId("SalesOrderSchedulesDialog").close();
		},

		onSaveSalesOrderList : function () {
			this.getView().getModel().submitBatch("SalesOrderListUpdateGroup");
		},

		onSetBindingContext : function () {
			var oText = this.getView().byId("FavoriteProductID"),
				oBindingContext = oText.getModel().createBindingContext("/ProductList('HT-1000')");

			oText.setBindingContext(oBindingContext);
			oText.bindProperty("text", "ProductID");
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
		},

		/**
		 * Refreshes (parts of) the UI. Offers to reset changes via two-way binding before, because
		 * otherwise the refresh would fail.
		 *
		 * @param {object} oRefreshable
		 *   The object to be refreshed, either the model or a binding
		 * @param {string} sRefreshableText
		 *   The text used for the refreshable in the confirmation dialog if there are pending
		 *   changes
		 * @param {string[]} [aUpdateGroupIds]
		 *   A list of IDs of batch groups to reset. If not given, the refreshable's default group
		 *   is reset.
		 */
		refresh : function (oRefreshable, sRefreshableText, aUpdateGroupIds) {
			if (oRefreshable.hasPendingChanges()) {
				MessageBox.confirm(
					"There are pending changes. Do you really want to refresh " + sRefreshableText
						+ "?",
					function onConfirm(sCode) {
						if (sCode === "OK") {
							if (aUpdateGroupIds) {
								aUpdateGroupIds.forEach(function (sUpdateGroupId) {
									oRefreshable.resetChanges(sUpdateGroupId);
								});
							} else {
								oRefreshable.resetChanges();
							}
							oRefreshable.refresh();
						}
					},
					"Refresh");
			} else {
				oRefreshable.refresh();
			}
		}
	});

});