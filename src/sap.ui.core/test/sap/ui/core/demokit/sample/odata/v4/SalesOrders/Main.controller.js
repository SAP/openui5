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
		sServiceNamespace = "com.sap.gateway.default.zui5_epm_sample.v0001.";

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
		},

		onBeforeRendering : function () {
			var oView = this.getView();

			oView.byId("SalesOrdersTitle").setBindingContext(
				oView.byId("SalesOrders").getBinding("items").getHeaderContext());
		},

		onCancelSalesOrder : function (oEvent) {
			this.getView().getModel().resetChanges("SalesOrderUpdateGroup");
		},

		onCancelSalesOrderSchedules : function (oEvent) {
			this.getView().byId("SalesOrderSchedulesDialog").close();
		},

		onCancelSalesOrderList : function (oEvent) {
			this.getView().getModel().resetChanges();
		},

		onConfirmSalesOrder : function () {
			var oModel = this.getView().getModel(),
				oTable = this.getView().byId("SalesOrders"),
				oSalesOrderContext = oTable.getSelectedItem().getBindingContext(),
				oAction = oModel.bindContext(sServiceNamespace + "SalesOrder_Confirm(...)",
					oSalesOrderContext),
				that = this;

			oAction.execute("actionGroup").then(
				function () {
					MessageToast.show("Sales order "
						+ oSalesOrderContext.getProperty("SalesOrderID") + " confirmed");
					that.refresh(that.getView().byId("SalesOrders").getBinding("items"),
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
						"SalesOrderID" : "",
						"Note" : null, // set to null to provoke server error if no note is entered
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
						"CreatedAt" : "1970-01-01T00:00:00Z",
						"ChangedAt" : "1970-01-01T00:00:00Z",
						"SOItemCount" : 0,
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

			oContext["delete"](oContext.getModel().getGroupId()).then(function () {
				MessageBox.success("Deleted Business Partner");
			}, function (oError) {
				MessageBox.error("Could not delete Business Partner: " + oError.message);
			});
		},

		onDeleteSalesOrder : function () {
			var sMessage,
				sOrderID,
				oTable = this.getView().byId("SalesOrders"),
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
			var oView = this.getView(),
				oModel = oView.getModel();

			this.refresh(oModel, "everything",
				[oModel.getUpdateGroupId(), "SalesOrderUpdateGroup"]);
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
			this.submitBatch("SalesOrderUpdateGroup");
		},

		onSaveSalesOrderSchedules : function () {
			this.getView().byId("SalesOrderSchedulesDialog").close();
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
				sNewIcon,
				oUIModel = oView.getModel("ui"),
				bDescending = oUIModel.getProperty("/bSortGrossAmountDescending");

			if (oBinding.hasPendingChanges()) {
				MessageBox.error("Cannot sort due to unsaved changes"
					+ "; save or reset changes before sorting");
				return;
			}

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
			oUIModel.setProperty("/bSortGrossAmountDescending", bDescending);
			oUIModel.setProperty("/sSortGrossAmountIcon", sNewIcon);
			oBinding.sort(bDescending === undefined
				? undefined
				: new Sorter("GrossAmount", bDescending)
			);

			// reset contexts for Supplier Details and remove Sales Oder Line Items selection
			oUIModel.setProperty("/bLineItemSelected", false);
			oView.byId("SalesOrderLineItems").removeSelections();
			oView.byId("SupplierContactData").setBindingContext(undefined);
			oView.byId("SupplierDetailsForm").setBindingContext(undefined);
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