/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter"
], function (Log, MessageBox, MessageToast, UI5Date, DateFormat, MessageType, Controller, Filter,
		FilterOperator, FilterType, Sorter) {
	"use strict";

	var oDateFormat = DateFormat.getTimeInstance({pattern : "HH:mm"}),
		sServiceNamespace = "com.sap.gateway.default.zui5_epm_sample.v0002.";

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrders.Main", {
		iTransientItems : 0,

		onBeforeRendering : function () {
			this.byId("salesOrderListTitle").setBindingContext(
				this.byId("SalesOrderList").getBinding("items").getHeaderContext());
		},

		onCancelSalesOrderChanges : function () {
			this.getView().getModel().resetChanges("SalesOrderUpdateGroup");
		},

		onCancelSalesOrderListChanges : function () {
			this.getView().getModel().resetChanges();
		},

		onCancelSelectedSalesOrderChanges : function () {
			this.byId("SalesOrderList").getSelectedItem().getBindingContext().resetChanges();
		},

		onCloseSalesOrderSchedules : function () {
			this.byId("salesOrderSchedulesDialog").close();
		},

		onCloseSimulateDiscountDialog : function () {
			this.byId("SimulateDiscountDialog").close();
		},

		onConfirmSalesOrder : function () {
			var oTable = this.byId("SalesOrderList"),
				oSalesOrderContext = oTable.getSelectedItem().getBindingContext(),
				sSalesOrderID = oSalesOrderContext.getProperty("SalesOrderID"),
				oView = this.getView(),
				oAction = oView.getModel().bindContext(
					sServiceNamespace + "SalesOrder_Confirm(...)", oSalesOrderContext),
				that = this;

			function onStrictHandlingFailed(aMessages) {
				oView.getModel("ui").setProperty("/aStrictMessages", aMessages);
				oView.setBusy(false);
				oView.byId("onStrictMessagesDialog").open();
				return new Promise(function (fnResolve) {
					that.fnStrictResolve = fnResolve;
				});
			}

			if (oSalesOrderContext.hasPendingChanges()) {
				MessageToast.show("Sales order " + oSalesOrderContext.getProperty("SalesOrderID")
					+ " cannot be confirmed due to pending changes");
			} else {
				oView.setBusy(true);
				oAction.invoke("confirm", false, onStrictHandlingFailed).then(function () {
					oView.setBusy(false);
					MessageToast.show("Sales order " + sSalesOrderID + " confirmed");
					oView.getModel("ui").setProperty("/bSalesOrderSelected", false);
				}, function () {
					oView.setBusy(false);
				});
				oSalesOrderContext.refresh("confirm", true);
				oView.getModel().submitBatch("confirm");
			}
		},

		onConfirmStrictMessages : function () {
			var oView = this.oView;

			oView.setBusy(true);
			this.fnStrictResolve(true);
			oView.byId("SalesOrderList").getSelectedItem().getBindingContext()
				.refresh("confirm", true);// in order to filter out the now "confirmed" sales order
			oView.getModel().submitBatch("confirm");
			oView.byId("onStrictMessagesDialog").close();
		},

		onCancelStrictMessages : function () {
			this.fnStrictResolve(false);
			this.oView.byId("onStrictMessagesDialog").close();
		},

		onCloseSalesOrderDialog : function () {
			this.byId("createSalesOrderDialog").close();
			// move the focus to the row of the newly created sales order
			this.byId("SalesOrderList").getItems()[0].focus();
		},

		onCompanyNameChanged : function (oEvent) {
			oEvent.getSource()
				.getBindingContext()
				.requestSideEffects([{$PropertyPath :
						"/com.sap.gateway.default.zui5_epm_sample.v0002.Container"
						+ "/SalesOrderList/SO_2_BP/CompanyName"}])
				.catch(function () { /*may fail because of previous requests*/ });
		},

		onCreateSalesOrder : function () {
			var oBPListBinding = this.byId("BuyerID::new").getBinding("suggestionItems"),
				oContext = this.byId("SalesOrderList").getBinding("items").create({
					BuyerID : "0100000000",
					LifecycleStatus : "N"
				}),
				oCreateSalesOrderDialog = this.byId("createSalesOrderDialog"),
				that = this;

			// select the newly created one
			this.byId("SalesOrderList").setSelectedItem(
				this.byId("SalesOrderList").getItems()[oContext.getIndex()]);
			this.setSalesOrderBindingContext(oContext);

			// resume binding to BusinessPartnerList to invoke request when dialog is opened
			if (oBPListBinding.isSuspended()) {
				oBPListBinding.filter(new Filter("BusinessPartnerRole", FilterOperator.EQ, "01"));
				oBPListBinding.sort(new Sorter("CompanyName"));
				oBPListBinding.resume();
			}
			oCreateSalesOrderDialog.setBindingContext(oContext);
			oCreateSalesOrderDialog.open();

			this.oCurrentCreateContext = oContext;
			// Note: this promise fails only if the transient entity is deleted
			oContext.created().then(function () {
				// in case of multiple create, select current
				if (oContext === that.oCurrentCreateContext) {
					that.setSalesOrderBindingContext(oContext);
				}

				return oContext.requestSideEffects([
					"/com.sap.gateway.default.zui5_epm_sample.v0002.Container/SalesOrderList/$count"
				], that.getView().getModel().getGroupId());
			}).then(function () {
				MessageBox.success("SalesOrder created: " + oContext.getProperty("SalesOrderID")
					+ ", " + oContext.getProperty("SO_2_BP/CompanyName"));
			}).catch(function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
			});
		},

		onCreateSalesOrderLineItem : function () {
			var oContext,
				oDeliveryDate = UI5Date.getInstance(),
				oTable = this.byId("SO_2_SOITEM"),
				oListBinding = oTable.getBinding("items"),
				sPath = oListBinding.getHeaderContext().getPath() + "/DeliveryDate",
				oType = oListBinding.getModel().getMetaModel().getUI5Type(sPath),
				that = this;

			oDeliveryDate.setFullYear(oDeliveryDate.getFullYear() + 1);
			oContext = oListBinding.create({
				CurrencyCode : "EUR",
				DeliveryDate : oType.getModelValue(oDeliveryDate),
				GrossAmount : "1137.64",
				ProductID : "HT-1000",
				Quantity : "1",
				QuantityUnit : "EA"
			}, false, true);
			// select the newly created one
			oTable.setSelectedItem(oTable.getItems()[oContext.getIndex()]);
			this.setSalesOrderLineItemBindingContext(oContext);
			oTable.getItems()[0].focus();

			// Note: this promise fails only if the transient entity is delete or canceled
			this.oSalesOrderLineItemCreated = oContext.created().then(function () {
				var oItem = oTable.getSelectedItem();

				MessageBox.success("Line item created: " + oContext.getProperty("ItemPosition"));
				if (oItem && oItem.getBindingContext() === oContext) {
					that.setSalesOrderLineItemBindingContext(oContext);
				}
			}).catch(function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
			});
		},

		onIncreaseSalesOrderItemsQuantity : function () {
			var oContext = this.byId("objectPage").getBindingContext(),
				oView = this.getView(),
				oAction = oView.getModel().bindContext("com.sap.gateway.default.zui5_epm_sample"
					+ ".v0002.SalesOrderIncreaseItemsQuantity(...)", oContext);

			if (oContext.hasPendingChanges()) {
				MessageBox.information("Cannot invoke action due to unsaved changes");
				return;
			}

			oView.setBusy(true);
			oAction.invoke().then(function () {
				MessageToast.show("All items' quantities increased by 1, "
					+ "sales order gross amount is now: "
					+ oAction.getBoundContext().getProperty("GrossAmount"));
			}, function (oError) {
				MessageToast.show(oError.message);
			});

			oContext.requestSideEffects([
					"ChangedAt",
					"GrossAmount",
					"Note",
					"Quantity",
					"SO_2_SOITEM/GrossAmount",
					"SO_2_SOITEM/Note",
					"SO_2_SOITEM/Quantity"
				], "$auto")
				.catch(function () { /*may fail because of previous requests*/ })
				.finally(function () {
					oView.setBusy(false);
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

		onDeleteBusinessPartner : function () {
			var oContext = this.byId("SO_2_BP::detail").getBindingContext();

			oContext.delete(oContext.getModel().getGroupId()).then(function () {
				MessageBox.success("Deleted business partner");
			});
		},

		onDeleteSalesOrder : function () {
			var oSalesOrderTable = this.byId("SalesOrderList"),
				oContext = oSalesOrderTable.getSelectedItem().getBindingContext(),
				that = this;

			this.setSalesOrderBindingContext(null); // hide the object page
			this.aDeletedSalesOrders.push(oContext);
			this.updateUndoButton();
			oContext.delete().catch(function () { // canceled or error already reported
				var oItem;

				if (!oSalesOrderTable.getSelectedItem()) {
					oItem = oSalesOrderTable.getItems().find(function (oItem0) {
						return oItem0.getBindingContext() === oContext;
					});
					if (oItem) {
						oSalesOrderTable.setSelectedItem(oItem);
						that.setSalesOrderBindingContext(oContext); // show the object page again
					}
				}
			}).finally(function () {
				that.aDeletedSalesOrders.splice(that.aDeletedSalesOrders.indexOf(oContext), 1);
				that.updateUndoButton();
			});
		},

		onDeleteSalesOrderLineItem : function () {
			this.byId("SO_2_SOITEM").getSelectedItem().getBindingContext().delete()
				.catch(function () { /* canceled or error already reported */ });
		},

		onDeleteSalesOrderSchedules : function () {
			var sGroupId = this.getView().getModel().getGroupId(),
				aPromises = [],
				oTable = this.byId("SO_2_SCHDL"),
				oUiModel = this.getView().getModel("ui");

			if (oTable.getBindingContext().hasPendingChanges()) {
				MessageBox.information("Cannot delete sales order schedules due to unsaved "
					+ "changes");
				return;
			}

			// Special case: Delete entities deeply nested in the cache
			oTable.getSelectedContexts().forEach(function (oContext) {
				aPromises.push(oContext.delete(sGroupId));
			});

			// removing schedule(s) implicitly removes items
			// -> remove context of dependent bindings and hide details
			this.setSalesOrderLineItemBindingContext();
			aPromises.push(this.requestSideEffects(sGroupId, "SO_2_SOITEM"));

			Promise.all(aPromises).then(function () {
				oTable.removeSelections();
				oUiModel.setProperty("/bScheduleSelected", false);
				MessageBox.success("Deleted " + aPromises.length + " sales order schedule(s)");
			}, function () { /* error already reported */ });
		},

		onInvokeSimulateDiscount : function () {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			this.oSimulateDiscount.invoke().then(function () {
				MessageToast.show("Simulation Result: "
					+ that.oSimulateDiscount.getBoundContext().getProperty("value"));
			}, function (oError) {
				MessageToast.show(oError.message);
			});
			oView.setBusy(false);
		},

		onFilter : function () {
			var oBinding = this.byId("SalesOrderList").getBinding("items"),
				sQuery = this.getView().getModel("ui").getProperty("/filterValue");

			if (oBinding.hasPendingChanges(true)) {
				MessageBox.error("Cannot filter due to unsaved changes"
					+ "; save or reset changes before filtering");
				return;
			}
			oBinding.filter(sQuery ? new Filter("GrossAmount", FilterOperator.GT, sQuery) : null,
				// FilterType.Control simulates a custom control; it combines the filter on
				// GrossAmount with the existing filter with a logical "and"
				FilterType.Control);
		},

		onFilterItems : function () {
			var oBinding = this.byId("SO_2_SOITEM").getBinding("items"),
				aFilters = oBinding.getFilters(FilterType.Application),
				sQuery = this.getView().getModel("ui").getProperty("/filterProductID");

			if (oBinding.hasPendingChanges(true)) {
				MessageBox.error("Cannot filter due to unsaved changes"
					+ "; save or reset changes before filtering");
				return;
			}

			aFilters = aFilters.filter(function (oFilter) {
				 return oFilter.getPath() !== "SOITEM_2_PRODUCT/ProductID";
			});

			if (sQuery) {
				aFilters.push(new Filter({
					path : "SOITEM_2_PRODUCT/ProductID",
					operator : FilterOperator.EQ,
					value1 : sQuery
				}));
			}
			oBinding.filter(aFilters);
		},

		onFilterMessages : function (oEvent) {
			var oBinding = this.byId("SO_2_SOITEM").getBinding("items"),
				fnFilter,
				oSelect = oEvent.getSource(),
				sMessageType = oSelect.getSelectedKey();

			if (sMessageType !== "Show All") {
				if (sMessageType !== "With Any Message") {
					fnFilter = function (oMessage) {
						return oMessage.type === sMessageType;
					};
				}
				oBinding.requestFilterForMessages(fnFilter).then(function (oFilter) {
					if (!oFilter) {
						MessageBox.information("There is no item with a message of type '"
							+ sMessageType + "'; showing all items");
						oSelect.setSelectedKey(MessageType.None);
					}
					oBinding.filter(oFilter, FilterType.Control); // preserve application filter
				});
			} else {
				oBinding.filter(undefined, FilterType.Control); // preserve application filter
			}
		},

		onInit : function () {
			var oHighlightBindingInfo = {
					formatter : function () {
						var aMessages,
							//formatter MUST be defined in a way that this is the control!
							oRowContext = this.getBindingContext();

						if (oRowContext) { // formatter is called with oRowContext null initially
							aMessages = oRowContext.getMessages();
							return aMessages.length
								? aMessages[0].type
								: MessageType.None;
						}
					},
					parts : [
						"messageModel>/",
						{ // ensure formatter is called on scrolling
							mode : "OneTime",
							path : "",
							targetType : "any"
						}
					]
				};

			this.initMessagePopover("showMessages");

			this.byId("highlight").bindProperty("highlight", oHighlightBindingInfo);
			this.byId("itemHighlight").bindProperty("highlight", oHighlightBindingInfo);
			this.aDeletedSalesOrders = [];
		},

		onProductIDChanged : function (oEvent) {
			var oItemContext = oEvent.getParameter("context");

			if (!oItemContext.isTransient()) {
				oItemContext.requestSideEffects([{$NavigationPropertyPath : "SOITEM_2_PRODUCT"}])
					.catch(function () { /*may fail because of previous requests*/ });
			}
		},

		onOpenSimulateDiscountDialog : function () {
			var oTable = this.byId("SalesOrderList"),
				oSalesOrderContext = oTable.getSelectedItem().getBindingContext();

			// create function only once
			if (!this.oSimulateDiscount) {
				this.oSimulateDiscount = this.getView().getModel("parameterContext").bindContext(
					"com.sap.gateway.default.zui5_epm_sample.v0002."
					+ "SalesOrderSimulateDiscount(...)");
				this.oSimulateDiscount.setParameter("Discount", 0);
				this.oSimulateDiscount.setParameter("Approver", "");
			}

			this.oSimulateDiscount.setContext(oSalesOrderContext);
			this.byId("SimulateDiscountForm").setBindingContext(oSalesOrderContext);
			this.byId("SimulateDiscountDialog").setBindingContext(
				this.oSimulateDiscount.getParameterContext(), "parameterContext");
			this.byId("SimulateDiscountResult::Result").setBindingContext(
				this.oSimulateDiscount.getBoundContext());
			this.byId("SimulateDiscountDialog").open();
		},

		onRefreshAll : function () {
			var oModel = this.getView().getModel();

			this.refresh(oModel, "everything",
				[oModel.getUpdateGroupId(), "SalesOrderUpdateGroup"]);
		},

		onRefreshFavoriteProduct : function () {
			this.refresh(this.byId("favoriteProduct").getBinding("value"),
				"the favorite product");
		},

		onRefreshSalesOrdersList : function () {
			this.refresh(this.byId("SalesOrderList").getBinding("items"),
				"all sales orders");
		},

		onRefreshSelectedSalesOrder : function () {
			var oSelectedSalesOrder = this.byId("SalesOrderList").getSelectedItem(),
				oSalesOrderContext;

			if (oSelectedSalesOrder) {
				oSalesOrderContext = oSelectedSalesOrder.getBindingContext();
				this.refresh(oSalesOrderContext,
					"sales order " + oSalesOrderContext.getProperty("SalesOrderID"));
			}
		},

		onSalesOrderSchedules : function () {
			this.byId("SO_2_SCHDL").removeSelections();
			this.getView().getModel("ui").setProperty("/bScheduleSelected", false);
			this.byId("salesOrderSchedulesDialog").open();
		},

		onSalesOrdersSelect : function (oEvent) {
			this.setSalesOrderBindingContext(oEvent.getParameters().listItem.getBindingContext());
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			this.setSalesOrderLineItemBindingContext(
				oEvent.getParameters().listItem.getBindingContext()
			);
		},

		onSalesOrderScheduleSelect : function () {
			this.getView().getModel("ui").setProperty("/bScheduleSelected",
				this.byId("SO_2_SCHDL").getSelectedContexts().length > 0);
		},

		onSaveSalesOrder : function () {
			var sGroupId = "SalesOrderUpdateGroup";

			this.requestSideEffects(sGroupId, "SO_2_SCHDL");
			this.submitBatch(sGroupId);
		},

		onSaveSalesOrderList : function () {
			this.submitBatch(this.getView().getModel().getUpdateGroupId());
		},

		onSetBindingContext : function () {
			var oInput = this.byId("favoriteProductId"),
				oBindingContext = oInput.getModel().createBindingContext("/ProductList('HT-1000')");

			oInput.setBindingContext(oBindingContext);
			oInput.bindProperty("value", "ProductID");
			oInput.bindProperty("tooltip", "ProductID");
			this.byId("favoriteProductId").focus();
		},

		onSortByGrossAmount : function () {
			var oBinding = this.byId("SalesOrderList").getBinding("items"),
				oUIModel = this.getView().getModel("ui"),
				bDescending = oUIModel.getProperty("/bSortGrossAmountDescending"),
				oSortOrder;

			if (oBinding.hasPendingChanges(true)) {
				MessageBox.error("Cannot sort due to unsaved changes"
					+ "; save or reset changes before sorting");
				return;
			}

			// choose next sort order: no sort -> ascending -> descending -> no sort
			oSortOrder = this.setNextSortOrder(bDescending);

			oUIModel.setProperty("/bSortGrossAmountDescending", oSortOrder.bDescending);
			oUIModel.setProperty("/sSortGrossAmountIcon", oSortOrder.sNewIcon);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("GrossAmount", oSortOrder.bDescending)
			);

			// reset contexts for Supplier Details and remove Sales Oder Line Items selection
			oUIModel.setProperty("/bLineItemSelected", false);
			this.byId("SO_2_SOITEM").removeSelections();
			this.byId("BP_2_CONTACT").setBindingContext(undefined);
			this.byId("PRODUCT_2_BP").setBindingContext(undefined);
		},

		onSortBySalesOrderID : function () {
			var oBinding = this.byId("SalesOrderList").getBinding("items"),
				oUIModel = this.getView().getModel("ui"),
				bDescending = oUIModel.getProperty("/bSortSalesOrderIDDescending"),
				oParameters = {},
				oSortOrder;

			if (oBinding.hasPendingChanges(true)) {
				MessageBox.error("Cannot change parameters due to unsaved changes"
					+ "; save or reset changes before sorting");
				return;
			}

			// choose next sort order: no sort -> ascending -> descending -> no sort
			oSortOrder = this.setNextSortOrder(bDescending);
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
		 * frequently, but not too many back-end requests.
		 */
		onUpdateFavoriteProduct : function (/*oEvent*/) {
			var oBinding = this.byId("favoriteProduct").getBinding("value");

			oBinding.setValue(oDateFormat.format(UI5Date.getInstance()));
		},

		onUndoSalesOrderDeletion : function () {
			var oContext = this.aDeletedSalesOrders[this.aDeletedSalesOrders.length - 1];

			oContext.resetChanges().then(function () {
				MessageToast.show("Sales order restored: " + oContext.getProperty("SalesOrderID"));
			});
		},

		produceTechnicalError : function () {
			var oViewElement = this.byId("favoriteProduct");

			oViewElement.bindProperty("value", {path : "/ProductList('HT-1000')/Unknown"});
		},

		/**
		 * Refreshes (parts of) the UI. Offers to reset changes via two-way binding before, because
		 * otherwise the refresh would fail.
		 *
		 * @param {sap.ui.model.odata.v4.ODataModel|sap.ui.model.odata.v4.ODataBinding
		 *     |sap.ui.model.odata.v4.Context} oRefreshable
		 *   The object to be refreshed, either the model or a binding or a context
		 * @param {string} sRefreshableText
		 *   The text used for the refreshable in the confirmation dialog if there are pending
		 *   changes
		 * @param {string[]} [aUpdateGroupIds]
		 *   A list of IDs of batch groups to reset. If not given, the refreshable's default group
		 *   is reset.
		 */
		refresh : function (oRefreshable, sRefreshableText, aUpdateGroupIds) {
			var bIgnoreKeptAlive = "isInitial" in oRefreshable
					? true // supported only for bindings
					: undefined;

			if (oRefreshable.hasPendingChanges(bIgnoreKeptAlive)) {
				MessageBox.confirm("There are pending changes which will be reset first."
						+ " Do you really want to refresh " + sRefreshableText + "?",
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
		 * Request side effects (and ETag) for the selected sales order plus the side effects
		 * specified by the given sNavigationPropertyPath.
		 *
		 * @param {string} sGroupId - The group ID
		 * @param {string} sNavigationPropertyPath - The navigation property path
		 */
		requestSideEffects : function (sGroupId, sNavigationPropertyPath) {
			this.byId("objectPage").getObjectBinding().getContext().requestSideEffects([
					{$NavigationPropertyPath : sNavigationPropertyPath},
					{$PropertyPath : "ChangedAt"},
					{$PropertyPath : "GrossAmount"},
					{$PropertyPath : "Messages"},
					{$PropertyPath : "Note"}
				],
				sGroupId
			).catch(function () { /*may fail because of previous requests*/ });
		},

		setNextSortOrder : function (bDescending) {
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

		setSalesOrderBindingContext : function (oSalesOrderContext) {
			var oSalesOrdersTable = this.byId("SalesOrderList"),
				oUIModel = this.getView().getModel("ui");

			oUIModel.setProperty("/bSalesOrderSelected", !!oSalesOrderContext);
			oUIModel.setProperty("/bSelectedSalesOrderTransient",
				oSalesOrderContext && oSalesOrderContext.isTransient());

			if (!oSalesOrderContext) {
				oSalesOrdersTable.removeSelections();
			} else if (oSalesOrderContext.isTransient()) {
				// TODO: eliminate this workaround:
				// to ensure that no dependent data for the newly created SO is fetched
				// unless it is persisted in the back end
				oSalesOrderContext = undefined;
			}
			this.byId("objectPage").setBindingContext(oSalesOrderContext);

			oUIModel.setProperty("/bLineItemSelected", false);
			this.byId("BP_2_CONTACT").setBindingContext(undefined);
			this.byId("PRODUCT_2_BP").setBindingContext(undefined);
			this.byId("lineItemsTitle").setBindingContext(
				this.byId("SO_2_SOITEM").getBinding("items").getHeaderContext(),
				"headerContext");
			this.byId("salesOrderSchedulesTitle").setBindingContext(
				this.byId("SO_2_SCHDL").getBinding("items").getHeaderContext(),
				"headerContext");
		},

		setSalesOrderLineItemBindingContext : function (oSalesOrderLineItemContext) {
			var oSalesOrderLineItemsTable = this.byId("SO_2_SOITEM"),
				oUIModel = this.getView().getModel("ui");

			oUIModel.setProperty("/bLineItemSelected", !!oSalesOrderLineItemContext);
			oUIModel.setProperty("/bSelectedSalesOrderItemTransient",
				oSalesOrderLineItemContext && oSalesOrderLineItemContext.isTransient());

			if (!oSalesOrderLineItemContext) {
				oSalesOrderLineItemsTable.removeSelections();
			}
			this.byId("BP_2_CONTACT").setBindingContext(oSalesOrderLineItemContext);
			this.byId("PRODUCT_2_BP").setBindingContext(oSalesOrderLineItemContext);
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

			oView.setBusy(true);
			return oView.getModel().submitBatch(sGroupId).finally(function () {
				oView.setBusy(false);
			});
		},

		updateUndoButton : function () {
			this.getView().getModel("ui").setProperty("/bSalesOrderDeleted",
				this.aDeletedSalesOrders.length > 0);
		}
	});
});
