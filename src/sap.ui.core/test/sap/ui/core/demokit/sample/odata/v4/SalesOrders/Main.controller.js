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
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Sorter'
], function (Dialog, MessageBox, MessageToast, DateFormat, Item, Controller, Filter, FilterOperator,
		JSONModel, Sorter) {
	"use strict";

	var oDateFormat = DateFormat.getTimeInstance({pattern : "HH:mm"}),
		sServiceNamespace = "com.sap.gateway.default.zui5_epm_sample.v0002.";

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
			}
			oView.byId("ObjectPage").setBindingContext(oSalesOrderContext);

			oUIModel.setProperty("/bLineItemSelected", false);
			oView.byId("SupplierContactData").setBindingContext(undefined);
			oView.byId("SupplierDetailsForm").setBindingContext(undefined);
			oView.byId("SalesOrderLineItemsTitle").setBindingContext(
				oView.byId("SalesOrderLineItems").getBinding("items").getHeaderContext(),
				"headerContext");
			oView.byId("SalesOrderSchedulesTitle").setBindingContext(
				oView.byId("SalesOrderSchedules").getBinding("items").getHeaderContext(),
				"headerContext");
		},

		_setSalesOrderLineItemBindingContext : function (oSalesOrderLineItemContext) {
			var oView = this.getView(),
				oSalesOrderLineItemsTable = oView.byId("SalesOrderLineItems"),
				oUIModel = oView.getModel("ui");

			oUIModel.setProperty("/bLineItemSelected", !!oSalesOrderLineItemContext);

			if (!oSalesOrderLineItemContext) {
				oSalesOrderLineItemsTable.removeSelections();
			} else if (oSalesOrderLineItemContext.isTransient()) {
				// TODO: eliminate this workaround:
				// to ensure that no dependent data for the newly created SO is fetched
				// unless it is persisted in backend (see: CPOUI5UISERVICESV3-649)
				oSalesOrderLineItemContext = undefined;
			}
			oView.byId("SupplierContactData").setBindingContext(oSalesOrderLineItemContext);
			oView.byId("SupplierDetailsForm").setBindingContext(oSalesOrderLineItemContext);
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

		onBeforeRendering : function () {
			var oView = this.getView();

			oView.byId("SalesOrdersTitle").setBindingContext(
				oView.byId("SalesOrders").getBinding("items").getHeaderContext());
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
			var oModel = this.getView().getModel(),
				oTable = this.byId("SalesOrders"),
				oSalesOrderContext = oTable.getSelectedItem().getBindingContext(),
				oAction = oModel.bindContext(sServiceNamespace + "SalesOrder_Confirm(...)",
					oSalesOrderContext),
				that = this;

			oAction.execute("actionGroup").then(
				function () {
					MessageToast.show("Sales order "
						+ oSalesOrderContext.getProperty("SalesOrderID") + " confirmed");
					that.refresh(that.byId("SalesOrders").getBinding("items"),
						"all sales orders");
				},
				function (oError) {
					MessageBox.error(oError.message);
				}
			);
			oModel.submitBatch("actionGroup");
		},

		onCloseSalesOrderDialog : function (oEvent) {
			var oView = this.getView();

			oView.byId("CreateSalesOrderDialog").close();
			// move the focus to the row of the newly created sales order
			oView.byId("SalesOrders").getItems()[0].focus();
		},

		onCreateSalesOrder : function (oEvent) {
			var oView = this.getView(),
				oContext = oView.byId("SalesOrders").getBinding("items")
					.create({
						// TODO where to get initial values from to avoid "failed to drill-down"
						// and "Not all properties provided while creation or update was executed."
						// $select?
						// key
						"SalesOrderID" : "",
						// properties
						"BuyerID" : "0100000000",
						"ChangedAt" : "1970-01-01T00:00:00Z",
						"CreatedAt" : "1970-01-01T00:00:00Z",
						"CurrencyCode" : "EUR",
						"GrossAmount" : "0.00",
						"LifecycleStatus" : "N",
						"LifecycleStatusDesc" : "New",
						"Note" : "A new Sales Order: " + new Date().toLocaleString(),
						"NoteLanguage" : "E",
						// navigation property
						"SO_2_BP" : null
					}),
				oCreateSalesOrderDialog = oView.byId("CreateSalesOrderDialog"),
				that = this;

			oView.getModel("ui").setProperty("/bCreateSalesOrderPending", true);

			// select the newly created one
			oView.byId("SalesOrders").setSelectedItem(
				oView.byId("SalesOrders").getItems()[oContext.getIndex()]);
			this._setSalesOrderBindingContext(oContext);

			oCreateSalesOrderDialog.setBindingContext(oContext);
			oCreateSalesOrderDialog.open();

			// Note: this promise fails only if the transient entity is deleted
			oContext.created().then(function () {
				that._setSalesOrderBindingContext(oContext);
				oView.getModel("ui").setProperty("/bCreateSalesOrderPending", false);
				MessageBox.success("SalesOrder created: " + oContext.getProperty("SalesOrderID"));
			}, function (oError) {
				// delete of transient entity
				oView.getModel("ui").setProperty("/bCreateSalesOrderPending", false);
			});
		},

		onCreateSalesOrderLineItem : function (oEvent) {
			var oContext,
				oDeliveryDate = new Date(),
				oView = this.getView();

			oDeliveryDate.setFullYear(oDeliveryDate.getFullYear() + 1);
			oDeliveryDate.setMilliseconds(0);
			oContext = oView.byId("SalesOrderLineItems").getBinding("items").create({
				// keys
				"ItemPosition" : "",
				"SalesOrderID" : "",
				// properties
				"CurrencyCode" : "EUR",
				"DeliveryDate" : oDeliveryDate.toJSON(),
				"GrossAmount" : "1137.64",
				"Note" : "",
				"NoteLanguage" : "E",
				"ProductID" : "HT-1000",
				"Quantity" : "1.000",
				"QuantityUnit" : "EA",
				// navigation properties
				"SOITEM_2_PRODUCT" : null
			});

			// select the newly created one
			oView.byId("SalesOrderLineItems").setSelectedItem(
				oView.byId("SalesOrderLineItems").getItems()[oContext.getIndex()]);
			this._setSalesOrderLineItemBindingContext(oContext);
			oView.getModel("ui").setProperty("/bCreateItemPending", true);

			// Note: this promise fails only if the transient entity is deleted
			oContext.created().then(function () {
				// TODO: we can't set the oContext for dependent BusinessPartner/Contact data form
				// because it would produce a new request (without expand for BP_2_CONTACT).
				// What we need would be a complete refresh for the selected sales order and all its
				// dependents
				// that._setSalesOrderLineItemBindingContext(oContext);
				oView.getModel("ui").setProperty("/bCreateItemPending", false);
				MessageBox.success("Line item created: " + oContext.getProperty("ItemPosition"));
			}, function (oError) {
				// delete of transient entity
				oView.getModel("ui").setProperty("/bCreateItemPending", false);
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
			var oContext = this.byId("BusinessPartner").getBindingContext();

			oContext["delete"](oContext.getModel().getGroupId()).then(function () {
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
				oSalesOrderContext["delete"](oSalesOrderContext.getModel().getGroupId())
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
				oSOLineItemContext = oTable.getSelectedItem().getBindingContext();

			function onConfirm(sCode) {
				if (sCode !== 'OK') {
					return;
				}
				// Use "$auto" or "$direct" just like selected when creating the model
				oSOLineItemContext["delete"](oSOLineItemContext.getModel().getGroupId())
					.then(function () {
						MessageBox.success("Deleted Sales Order " + sSalesOrderLineItem);
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
			var oView = this.getView(),
				sGroupId = oView.getModel().getGroupId(),
				aPromises = [],
				oTable = oView.byId("SalesOrderSchedules");

			// Special case: Delete entities deeply nested in the cache
			oTable.getSelectedContexts().forEach(function (oContext) {
				aPromises.push(oContext["delete"](sGroupId));
			});
			Promise.all(aPromises).then(function () {
				oTable.removeSelections();
				oView.getModel("ui").setProperty("/bScheduleSelected", false);
				MessageBox.success("Deleted " + aPromises.length + " Sales Order Schedule(s)");
			}, function (oError) {
				MessageBox.error("Could not delete a Sales Order Schedule: " + oError.message);
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
				? new Filter("SOITEM_2_PRODUCT/ProductID", FilterOperator.EQ, sQuery)
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
			var oView = this.getView(),
				oModel = oView.getModel();

			this.refresh(oModel, "everything",
				[oModel.getUpdateGroupId(), "SalesOrderUpdateGroup"]);
		},

		onRefreshFavoriteProduct : function (oEvent) {
			this.refresh(this.byId("FavoriteProduct").getBinding("value"),
				"the favorite product");
		},

//		onRefreshSalesOrderDetails : function (oEvent) {
//			this.refresh(this.byId("ObjectPage").getElementBinding(),
//				"the sales order");
//		},

		onRefreshSalesOrdersList : function (oEvent) {
			this.refresh(this.byId("SalesOrders").getBinding("items"),
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
			this._setSalesOrderLineItemBindingContext(
				oEvent.getParameters().listItem.getBindingContext()
			);
		},

		onSalesOrderScheduleSelect : function (oEvent) {
			var oView = this.getView();

			oView.getModel("ui").setProperty("/bScheduleSelected",
				oView.byId("SalesOrderSchedules").getSelectedContexts().length > 0);
		},

		onSaveSalesOrder : function () {
			this.submitBatch("SalesOrderUpdateGroup");
		},

		onSaveSalesOrderList : function () {
			this.submitBatch(this.getView().getModel().getUpdateGroupId());
		},

		onSetBindingContext : function () {
			var oView = this.getView(),
				oInput = oView.byId("FavoriteProductID"),
				oBindingContext = oInput.getModel().createBindingContext("/ProductList('HT-1000')");

			oInput.setBindingContext(oBindingContext);
			oInput.bindProperty("value", "ProductID");
			oInput.bindProperty("tooltip", "ProductID");
			oView.byId("FavoriteProductID").focus();
		},

		onSortByGrossAmount : function () {
			var oView = this.getView(),
				oBinding = oView.byId("SalesOrders").getBinding("items"),
				oUIModel = oView.getModel("ui"),
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
			oView.byId("SalesOrderLineItems").removeSelections();
			oView.byId("SupplierContactData").setBindingContext(undefined);
			oView.byId("SupplierDetailsForm").setBindingContext(undefined);
		},

		onSortBySalesOrderID : function () {
			var oView = this.getView(),
				oBinding = oView.byId("SalesOrders").getBinding("items"),
				oUIModel = oView.getModel("ui"),
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
		 * Submits the given batch group while the view is locked.
		 *
		 * @param {string} sGroupId
		 *   the group ID
		 */
		submitBatch : function (sGroupId) {
			var oView = this.getView();

			function resetBusy() {
				oView.setBusy(false);
			}

			oView.setBusy(true);
			oView.getModel().submitBatch(sGroupId).then(resetBusy, resetBusy);
		}
	});

});