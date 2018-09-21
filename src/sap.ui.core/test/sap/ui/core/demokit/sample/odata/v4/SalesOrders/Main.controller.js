/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/Dialog",
	"sap/m/MessageBox",
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/m/MessageToast",
	"sap/ui/core/Item",
	"sap/ui/core/MessageType",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter"
], function (Log, Dialog, MessageBox, MessageItem, MessagePopover, MessageToast, Item, MessageType,
		DateFormat, Controller, Filter, FilterOperator, FilterType, Sorter) {
	"use strict";

	var oDateFormat = DateFormat.getTimeInstance({pattern : "HH:mm"}),
		sServiceNamespace = "com.sap.gateway.default.zui5_epm_sample.v0002.";

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrders.Main", {
		_setSalesOrderBindingContext : function (oSalesOrderContext) {
			var oSalesOrdersTable = this.byId("SalesOrders"),
				oUIModel = this.getView().getModel("ui");

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
			}
			this.byId("ObjectPage").setBindingContext(oSalesOrderContext);

			oUIModel.setProperty("/bLineItemSelected", false);
			this.byId("SupplierContactData").setBindingContext(undefined);
			this.byId("SupplierDetailsForm").setBindingContext(undefined);
			this.byId("SalesOrderLineItemsTitle").setBindingContext(
				this.byId("SalesOrderLineItems").getBinding("items").getHeaderContext(),
				"headerContext");
			this.byId("SalesOrderSchedulesTitle").setBindingContext(
				this.byId("SalesOrderSchedules").getBinding("items").getHeaderContext(),
				"headerContext");
		},

		_setSalesOrderLineItemBindingContext : function (oSalesOrderLineItemContext) {
			var oSalesOrderLineItemsTable = this.byId("SalesOrderLineItems"),
				oUIModel = this.getView().getModel("ui");

			oUIModel.setProperty("/bLineItemSelected", !!oSalesOrderLineItemContext);

			if (!oSalesOrderLineItemContext) {
				oSalesOrderLineItemsTable.removeSelections();
			} else if (oSalesOrderLineItemContext.isTransient()) {
				// TODO: eliminate this workaround:
				// to ensure that no dependent data for the newly created SO is fetched
				// unless it is persisted in backend (see: CPOUI5UISERVICESV3-649)
				oSalesOrderLineItemContext = undefined;
			}
			this.byId("SupplierContactData").setBindingContext(oSalesOrderLineItemContext);
			this.byId("SupplierDetailsForm").setBindingContext(oSalesOrderLineItemContext);
		},

		_setNextSortOrder : function (bDescending) {
			var sNewIcon;

			// choose next sort order: no sort -> ascending -> descending -> no sort
			if (bDescending === undefined) {
				sNewIcon = "sap-icon://sort-ascending";
				bDescending = false;
			} else if (bDescending === false) {
				sNewIcon = "sap-icon://sort-descending";
				bDescending = true;
			} else {
				sNewIcon = "";
				bDescending = undefined;
			}
			return {bDescending : bDescending, sNewIcon : sNewIcon};
		},

		/**
		 * Listens to all changes in the message model, decides whether to open the message popover
		 * and updates <code>iMessages</code> within the UI model.
		 *
		 * @param {object} oEvent
		 *   The change event
		 *
		 */
		handleMessagesChange : function (oEvent) {
			var aMessageContexts = oEvent.getSource().getCurrentContexts();

			function worthy(aMessageContexts) {
				return aMessageContexts.some(function (oContext) {
					var oMessage = oContext.getObject();

					return oMessage.technical === true;
				});
			}

			if (!this.messagePopover.isOpen() && worthy(aMessageContexts)) {
				this.messagePopover.openBy(this.byId("MessagesButton"));
			}
			this.getView().getModel("ui").setProperty("/iMessages", aMessageContexts.length);
		},

		onBeforeRendering : function () {
			this.byId("SalesOrdersTitle").setBindingContext(
				this.byId("SalesOrders").getBinding("items").getHeaderContext());
		},

		onCancelSalesOrderChanges : function (oEvent) {
			this.getView().getModel().resetChanges("SalesOrderUpdateGroup");
		},

		onCancelSalesOrderListChanges : function (oEvent) {
			this.getView().getModel().resetChanges();
		},

		onCloseSalesOrderSchedules : function (oEvent) {
			this.byId("SalesOrderSchedulesDialog").close();
		},

		onConfirmSalesOrder : function () {
			var oTable = this.byId("SalesOrders"),
				oSalesOrderContext = oTable.getSelectedItem().getBindingContext(),
				sSalesOrderID = oSalesOrderContext.getProperty("SalesOrderID"),
				oView = this.getView(),
				oAction = oView.getModel().bindContext(
					sServiceNamespace + "SalesOrder_Confirm(...)", oSalesOrderContext);

			if (oSalesOrderContext.hasPendingChanges()) {
				MessageToast.show("Sales order " + oSalesOrderContext.getProperty("SalesOrderID")
					+ " cannot be confirmed due to pending changes");
			} else {
				oView.setBusy(true);
				oAction.execute().then(function () {
					oView.setBusy(false);
					MessageToast.show("Sales order " + sSalesOrderID + " confirmed");
				}, function (oError) {
					oView.setBusy(false);
					MessageBox.error(oError.message);
				});
				oSalesOrderContext.refresh(undefined, true);
			}
		},

		onCloseSalesOrderDialog : function (oEvent) {
			this.byId("CreateSalesOrderDialog").close();
			// move the focus to the row of the newly created sales order
			this.byId("SalesOrders").getItems()[0].focus();
		},

		onCreateSalesOrder : function (oEvent) {
			var oBPListBinding = this.byId("NewBuyerID").getBinding("suggestionItems"),
				oContext = this.byId("SalesOrders").getBinding("items").create({
					"BuyerID" : "0100000000",
					"LifecycleStatus" : "N"
				}),
				oCreateSalesOrderDialog = this.byId("CreateSalesOrderDialog"),
				oUiModel = this.getView().getModel("ui"),
				that = this;

			oUiModel.setProperty("/bCreateSalesOrderPending", true);

			// select the newly created one
			this.byId("SalesOrders").setSelectedItem(
				this.byId("SalesOrders").getItems()[oContext.getIndex()]);
			this._setSalesOrderBindingContext(oContext);

			// resume binding to BusinessPartnerList to trigger request when dialog is opened
			if (oBPListBinding.isSuspended()) {
				oBPListBinding.resume();
			}
			oCreateSalesOrderDialog.setBindingContext(oContext);
			oCreateSalesOrderDialog.open();

			// Note: this promise fails only if the transient entity is deleted
			oContext.created().then(function () {
				that._setSalesOrderBindingContext(oContext);
				oUiModel.setProperty("/bCreateSalesOrderPending", false);
				MessageBox.success("SalesOrder created: " + oContext.getProperty("SalesOrderID")
					+ ", " + oContext.getProperty("SO_2_BP/CompanyName"));
			}, function (oError) {
				// delete of transient entity
				oUiModel.setProperty("/bCreateSalesOrderPending", false);
			});
		},

		onCreateSalesOrderLineItem : function (oEvent) {
			var oContext,
				oDeliveryDate = new Date(),
				that = this;

			oDeliveryDate.setFullYear(oDeliveryDate.getFullYear() + 1);
			oDeliveryDate.setMilliseconds(0);
			oContext = this.byId("SalesOrderLineItems").getBinding("items").create({
				"DeliveryDate" : oDeliveryDate.toJSON(),
				"GrossAmount" : "1137.64",
				"ProductID" : "HT-1000",
				"Quantity" : "1.000",
				"QuantityUnit" : "EA"
			});

			// select the newly created one
			this.byId("SalesOrderLineItems").setSelectedItem(
				this.byId("SalesOrderLineItems").getItems()[oContext.getIndex()]);
			this._setSalesOrderLineItemBindingContext(oContext);
			this.toggleSelectionMode(false);
			this.byId("SalesOrderLineItems").getItems()[0].focus();

			// Note: this promise fails only if the transient entity is deleted
			this.oSalesOrderLineItemCreated = oContext.created().then(function () {
				that.toggleSelectionMode(true);
				MessageBox.success("Line item created: " + oContext.getProperty("ItemPosition"));
			}, function (oError) {
				// delete of transient entity
				that.toggleSelectionMode(true);
			});
		},

		onDataEvents : function (oEvent) {
			var aSalesOrderIDs = [],
				oSource = oEvent.getSource();

			Log.info(oEvent.getId() + " event processed for path " + oSource.getPath(),
				oSource, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");

			if (oEvent.getId() === "dataReceived") {
				if (oSource.getPath() === "/SalesOrderList") {
					oSource.getCurrentContexts().forEach(function (oContext) {
						aSalesOrderIDs.push(oContext && oContext.getProperty("SalesOrderID"));
					});
					Log.info("Current SalesOrderIDs: " + aSalesOrderIDs.join(", "),
						null, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");
				} else if (oSource.getPath() === "/ProductList('HT-1000')/Name") {
					Log.info("Favorite Product ID: " + oSource.getValue(),
						null, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");
				} else if (/^\/SalesOrderList\(.*\)/.test(oSource.getPath())) {
					Log.info("Current Sales Order: "
						+ oSource.getBoundContext().getProperty("SalesOrderID"),
						null, "sap.ui.core.sample.odata.v4.SalesOrders.Main.controller");
				}
			}
		},

		onDeleteBusinessPartner: function () {
			var oContext = this.byId("BusinessPartner").getBindingContext();

			oContext.delete(oContext.getModel().getGroupId()).then(function () {
				MessageBox.success("Deleted Business Partner");
			}, function (oError) {
				MessageBox.error("Could not delete Business Partner: " + oError.message);
			});
		},

		onDeleteSalesOrder : function () {
			var sMessage,
				sOrderID,
				oTable = this.byId("SalesOrders"),
				oSalesOrderContext = oTable.getSelectedItem().getBindingContext();

			function onConfirm(sCode) {
				if (sCode !== 'OK') {
					return;
				}
				// Use "$auto" or "$direct" just like selected when creating the model
				oSalesOrderContext.delete(oSalesOrderContext.getModel().getGroupId())
					.then(function () {
						MessageBox.success("Deleted Sales Order " + sOrderID);
					}, function (oError) {
						MessageBox.error("Could not delete Sales Order " + sOrderID + ": "
							+ oError.message);
					});
			}

			sOrderID = oSalesOrderContext.getProperty("SalesOrderID", true);
			sMessage = "Do you really want to delete: " + sOrderID
				+ ", Gross Amount: " + oSalesOrderContext.getProperty("GrossAmount", true)
				+ " " + oSalesOrderContext.getProperty("CurrencyCode", true) + "?";
			MessageBox.confirm(sMessage, onConfirm, "Sales Order Deletion");
		},

		onDeleteSalesOrderLineItem : function () {
			var sMessage,
				sSalesOrderLineItem,
				oTable = this.byId("SalesOrderLineItems"),
				oSOLineItemContext = oTable.getSelectedItem().getBindingContext(),
				that = this;

			function onConfirm(sCode) {
				if (sCode !== 'OK') {
					return;
				}
				// Use "$auto" or "$direct" just like selected when creating the model
				oSOLineItemContext.delete(oSOLineItemContext.getModel().getGroupId())
					.then(function () {
						MessageBox.success("Deleted Sales Order " + sSalesOrderLineItem);
						// item removed, remove context of dependent bindings and hide details
						that._setSalesOrderLineItemBindingContext();
						that.refreshSingle();
					}, function (oError) {
						MessageBox.error("Could not delete Sales Order " + sSalesOrderLineItem
							+ ": " + oError.message);
					});
			}

			sSalesOrderLineItem = oSOLineItemContext.getProperty("SalesOrderID", true)
				+ "/" + oSOLineItemContext.getProperty("ItemPosition", true);
			sMessage = "Do you really want to delete: " + sSalesOrderLineItem + "?";
			MessageBox.confirm(sMessage, onConfirm, "Sales Order Line Item Deletion");
		},

		onDeleteSalesOrderSchedules : function (oEvent) {
			var sGroupId = this.getView().getModel().getGroupId(),
				aPromises = [],
				oTable = this.byId("SalesOrderSchedules"),
				oUiModel = this.getView().getModel("ui");

			// Special case: Delete entities deeply nested in the cache
			oTable.getSelectedContexts().forEach(function (oContext) {
				aPromises.push(oContext.delete(sGroupId));
			});
			Promise.all(aPromises).then(function () {
				oTable.removeSelections();
				oUiModel.setProperty("/bScheduleSelected", false);
				MessageBox.success("Deleted " + aPromises.length + " Sales Order Schedule(s)");
			}, function (oError) {
				MessageBox.error("Could not delete a Sales Order Schedule: " + oError.message);
			});
		},

		onExit : function () {
			this.messagePopover.destroy();
		},

		onFilter : function (oEvent) {
			var oBinding = this.byId("SalesOrders").getBinding("items"),
				// TODO validation
				sQuery = this.getView().getModel("ui").getProperty("/filterValue");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error("Cannot filter due to unsaved changes"
					+ "; save or reset changes before filtering");
				return;
			}
			oBinding.filter(sQuery ? new Filter("GrossAmount", FilterOperator.GT, sQuery) : null,
				// FilterType.Control simulates a custom control; it combines the filter on
				// GrossAmount with the existing filter with a logical "and"
				FilterType.Control);
		},

		onFilterItems : function (oEvent) {
			var oBinding = this.byId("SalesOrderLineItems").getBinding("items"),
				sQuery = this.getView().getModel("ui").getProperty("/filterProductID");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error("Cannot filter due to unsaved changes"
					+ "; save or reset changes before filtering");
				return;
			}
			oBinding.filter(sQuery
				? new Filter("SOITEM_2_PRODUCT/ProductID", FilterOperator.EQ, sQuery)
				: null);
		},

		onInit : function () {
			this.messagePopover = new MessagePopover({
				items : {
					path :"message>/",
					template : new MessageItem({
						description : "{message>description}",
						longtextUrl : "{message>descriptionUrl}",
						title : "{message>message}",
						type : "{message>type}"})
				}
			});

			this.messagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),
				"message");

			this.messagePopover.getBinding("items").attachChange(this.handleMessagesChange, this);
			this.messagePopover.attachAfterClose(function (oEvent) {
				var oMessageManager = sap.ui.getCore().getMessageManager(),
					aMessages;

				// remove all bound messages which have to be handled by the application
				aMessages = oMessageManager.getMessageModel().getData().filter(function (oMessage) {
					return oMessage.persistent;
				});
				oMessageManager.removeMessages(aMessages);
			});
		},

		onMessagePopoverPress: function (oEvent) {
			this.messagePopover.toggle(oEvent.getSource());
		},

		onRefreshAll : function () {
			var oModel = this.getView().getModel();

			this.refresh(oModel, "everything",
				[oModel.getUpdateGroupId(), "SalesOrderUpdateGroup"]);
		},

		onRefreshFavoriteProduct : function (oEvent) {
			this.refresh(this.byId("FavoriteProduct").getBinding("value"),
				"the favorite product");
		},

		onRefreshSalesOrdersList : function (oEvent) {
			this.refresh(this.byId("SalesOrders").getBinding("items"),
				"all sales orders");
		},

		onRefreshSelectedSalesOrder : function () {
			var oSelectedSalesOrder = this.byId("SalesOrders").getSelectedItem(),
				oSalesOrderContext;

			if (oSelectedSalesOrder) {
				oSalesOrderContext = oSelectedSalesOrder.getBindingContext();
				this.refresh(oSalesOrderContext,
					"sales order " + oSalesOrderContext.getProperty("SalesOrderID"));
			}
		},

		onSalesOrderSchedules : function (oEvent) {
			this.byId("SalesOrderSchedules").removeSelections();
			this.getView().getModel("ui").setProperty("/bScheduleSelected", false);
			this.byId("SalesOrderSchedulesDialog").open();
		},

		onSalesOrdersSelect : function (oEvent) {
			this._setSalesOrderBindingContext(oEvent.getParameters().listItem.getBindingContext());
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			this._setSalesOrderLineItemBindingContext(
				oEvent.getParameters().listItem.getBindingContext()
			);
		},

		onSalesOrderScheduleSelect : function (oEvent) {
			this.getView().getModel("ui").setProperty("/bScheduleSelected",
				this.byId("SalesOrderSchedules").getSelectedContexts().length > 0);
		},

		onSaveSalesOrder : function () {
			var that = this;

			this.submitBatch("SalesOrderUpdateGroup").then(function () {
				// wait until created handler (if any) is processed
				return that.oSalesOrderLineItemCreated;
			}).then(function () {
				that.refreshSingle();
			});
		},

		onSaveSalesOrderList : function () {
			this.submitBatch(this.getView().getModel().getUpdateGroupId());
		},

		onSetBindingContext : function () {
			var oInput = this.byId("FavoriteProductID"),
				oBindingContext = oInput.getModel().createBindingContext("/ProductList('HT-1000')");

			oInput.setBindingContext(oBindingContext);
			oInput.bindProperty("value", "ProductID");
			oInput.bindProperty("tooltip", "ProductID");
			this.byId("FavoriteProductID").focus();
		},

		onSortByGrossAmount : function () {
			var oBinding = this.byId("SalesOrders").getBinding("items"),
				oUIModel = this.getView().getModel("ui"),
				bDescending = oUIModel.getProperty("/bSortGrossAmountDescending"),
				oSortOrder;

			if (oBinding.hasPendingChanges()) {
				MessageBox.error("Cannot sort due to unsaved changes"
					+ "; save or reset changes before sorting");
				return;
			}

			// choose next sort order: no sort -> ascending -> descending -> no sort
			oSortOrder = this._setNextSortOrder(bDescending);

			oUIModel.setProperty("/bSortGrossAmountDescending", oSortOrder.bDescending);
			oUIModel.setProperty("/sSortGrossAmountIcon", oSortOrder.sNewIcon);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("GrossAmount", oSortOrder.bDescending)
			);

			// reset contexts for Supplier Details and remove Sales Oder Line Items selection
			oUIModel.setProperty("/bLineItemSelected", false);
			this.byId("SalesOrderLineItems").removeSelections();
			this.byId("SupplierContactData").setBindingContext(undefined);
			this.byId("SupplierDetailsForm").setBindingContext(undefined);
		},

		onSortBySalesOrderID : function () {
			var oBinding = this.byId("SalesOrders").getBinding("items"),
				oUIModel = this.getView().getModel("ui"),
				bDescending = oUIModel.getProperty("/bSortSalesOrderIDDescending"),
				oParameters = {},
				oSortOrder;

			if (oBinding.hasPendingChanges()) {
				MessageBox.error("Cannot change parameters due to unsaved changes"
					+ "; save or reset changes before sorting");
				return;
			}

			// choose next sort order: no sort -> ascending -> descending -> no sort
			oSortOrder = this._setNextSortOrder(bDescending);
			if (oSortOrder.bDescending === undefined) {
				oParameters.$orderby = undefined;
			} else {
				oParameters.$orderby = "SalesOrderID" + (oSortOrder.bDescending ? " desc" : "");
			}
			oBinding.changeParameters(oParameters);
			oUIModel.setProperty("/bSortSalesOrderIDDescending", oSortOrder.bDescending);
			oUIModel.setProperty("/sSortSalesOrderIDIcon", oSortOrder.sNewIcon);
		},

		/**
		 * Update the favorite product's name by replacing it with the current time (hour/minute).
		 * This shows a somehow useful update, you should be able to see changes on the UI quite
		 * frequently, but not too many backend requests.
		 */
		onUpdateFavoriteProduct : function (/*oEvent*/) {
			var oBinding = this.byId("FavoriteProduct").getBinding("value");

			oBinding.setValue(oDateFormat.format(new Date()));
		},

		produceTechnicalError : function () {
			var oViewElement = this.byId("FavoriteProduct");

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
		},

		/**
		 * Refreshes the given context if there are no pending changes.
		 */
		refreshSingle : function () {
			var oContext = this.byId("ObjectPage").getObjectBinding().getContext();

			if (oContext.hasPendingChanges()) {
				MessageToast.show("Cannot refresh due to unsaved changes, reset changes before"
					+ " refresh");
			} else {
				// Trigger refresh for the corresponding entry in the SalesOrderList to get
				// the new ETag also there. This refreshes also all dependent bindings.
				oContext.refresh();
			}
		},

		/**
		 * Submits the given batch group while the view is locked.
		 *
		 * @param {string} sGroupId
		 *   the group ID
		 * @returns {Promise}
		 *   A Promise which is resolved after the Promise returned by
		 *   {@link sap.ui.model.odata.v4.ODataModel#submitBatch} is either resolved or rejected
		 */
		submitBatch : function (sGroupId) {
			var oView = this.getView();

			function resetBusy() {
				oView.setBusy(false);
			}

			oView.setBusy(true);
			return oView.getModel().submitBatch(sGroupId).then(resetBusy, resetBusy);
		},

		/**
		 * Toggles the selection mode for the sales order table. Remembers or restores the last
		 * selected item.
		 *
		 * @param {boolean} bSingleSelectMaster
		 *   If <code>true</code> the selection mode is set to <code>SingleSelectMaster</code>
		 *   and the last selected item is restored. Otherwise the selection mode is set to <code>
		 *   None</code> and the currently selected item is remembered.
		 */
		toggleSelectionMode : function (bSingleSelectMaster) {
			var oTable = this.byId("SalesOrders"),
				oSelectedItem = oTable.getSelectedItem();

			// Note: The table's selection mode depends on bCreateItemPending, - see view
			this.getView().getModel("ui").setProperty("/bCreateItemPending", !bSingleSelectMaster);

			if (!bSingleSelectMaster) {
				this.iSelectedSalesOrder = oSelectedItem.getBindingContext().getIndex();
			} else if (this.iSelectedSalesOrder !== undefined) {
				oTable.setSelectedItem(oTable.getItems()[this.iSelectedSalesOrder]);
				this.iSelectedSalesOrder = undefined;
			}
		}
	});

});