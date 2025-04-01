/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/library",
	"sap/ui/core/Messaging",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function (Log, MessageBox, MessageToast, coreLibrary, Messaging, Controller, Filter,
		FilterOperator, Sorter) {
	"use strict";

	const ValueState = coreLibrary.ValueState;
	const SortOrder = coreLibrary.SortOrder;
	const oCreationDefaults = {
		// mandatory properties for new entity which are not available on UI
		Category : "Notebooks",
		MeasureUnit : "EA", // wrong service expectation
		SupplierID : "0100000046",
		TaxTarifCode : 1,
		TypeCode : "PR",
		// some useful defaults
		CurrencyCode : "EUR",
		WeightUnit : "KG"
	};

	return Controller.extend("sap.ui.core.sample.odata.v4.Products.Main", {
		/* The number of POST requests which are not yet completed */
		iCreates : 0,

		/*
		 * Enable add button if and only if creation row has no invalid user input (and it was not
		 * yet used).
		 */
		enableAddButton() {
			var that = this;

			function isOK(oContent) {
				return !oContent.getValueState || oContent.getValueState() === "None";
			}

			setTimeout(function () {
				var aContents = that.byId("newEntry").getContent();

				that.byId("addButton").setEnabled(aContents.every(isOK));
			}, 0);
		},

		/*
		 * "Add" button's event handler: add new row to table.
		 */
		onAdd() {
			var oContext = this.byId("newEntry").getBindingContext(),
				oNewEntry = oContext.getObject();

			oNewEntry["@odata.etag"] = null; // avoid "Failed to drill-down"

			// add new row to table
			this.byId("ProductList").getBinding("items").create(oNewEntry).created()
				.catch(function (oError) {
					if (!oError.canceled) {
						throw oError; // unexpected error
					}
				});

			// clear creation row
			this.onClearRow();
		},

		/*
		 * "Clear row" button's event handler: clear creation row.
		 */
		onClearRow() {
			var aContents = this.byId("newEntry").getContent();

			// remove invalid user input, including the corresponding messages
			aContents.forEach(function (oContent) {
				if (oContent.getValueState) {
					oContent.setValue("");
					oContent.setValueState(ValueState.None);
					Messaging.removeMessages(
						oContent.getBinding("value").getDataState().getMessages());
				}
			});

			// destroy old "creation row"
			this.byId("newEntry").getBindingContext().delete("$direct");

			// create new "creation row"
			this.setNewEntryContext();

			this.enableAddButton(); // check again
		},

		/*
		 * Event handler for POST requests for created entities. Used to unlock the "Products"
		 * table.
		 *
		 * @param {sap.ui.base.Event} oEvent
		 *   The event object containing parameters:
		 *   <ul>
		 *     <li> {sap.ui.model.odata.v4.Context} context
		 *     <li> {boolean} success
		 *   </ul>
		 */
		onCreateCompleted() {
			this.iCreates -= 1;
			if (this.iCreates === 0) {
				this.byId("ProductList").setBusy(false);
			}
		},

		/**
		 * Creates a new product with some default values within the products table.
		 */
		onCreateInline() {
			this.byId("ProductList").getBinding("items").create({
					...oCreationDefaults,
					ProductID : "MY-" + new Date().getMilliseconds(),
					Name : "My Product"
				}, /*bSkipRefresh*/true, /*bAtEnd*/false, /*bInactive*/true);
		},

		/*
		 * Event handler is called when a POST request for a created entity is sent to the server.
		 * Used to lock the "Products" table to avoid modifications while POST request is running.
		 */
		onCreateSent() {
			if (this.iCreates === 0) {
				this.byId("ProductList").setBusy(true);
			}
			this.iCreates += 1;
		},

		/**
		 * Deletes the selected products.
		 */
		onDelete() {
			this.byId("ProductList").getBinding("items").getAllCurrentContexts()
				.forEach((oContext) => {
					if (oContext.isSelected()) {
						oContext.delete();
					}
				});
		},

		onExit() {
			this.getView().getModel("ui").destroy();
			return Controller.prototype.onExit.apply(this, arguments);
		},

		/**
		 * Filters the product list by the currency code entered in the input field.
		 *
		 * @param {sap.ui.base.Event} oEvent The event object
		 */
		onFilter(oEvent) {
			const sValue = oEvent.getParameter("value");
			const aFilter = sValue
				? [new Filter("CurrencyCode", FilterOperator.EQ, sValue)]
				: [];
			this.byId("ProductList").getBinding("items").filter(aFilter);
		},

		/*
		 * Controller's initialization.
		 */
		onInit() {
			this.initMessagePopover("messagesButton");

			const oView = this.getView();
			const oModel = oView.getModel();

			// set up hidden list binding for creation row
			this.oHiddenListBinding = oModel
				.bindList("/ProductList", null, [], [], {$$updateGroupId : "doNotSubmit"});
			// create new "creation row"
			this.setNewEntryContext();

			const oUriParameters = new URLSearchParams(window.location.search);
			if (oUriParameters.get("clearSelectionOnFilter") === "false") {
				const oBindingInfo = this.byId("ProductList").getBindingInfo("items");
				delete oBindingInfo.parameters.$$clearSelectionOnFilter;
				this.byId("ProductList").bindItems(oBindingInfo);
			}
			const oListBinding = this.byId("ProductList").getBinding("items");
			oView.setModel(oModel, "header");
			oView.setBindingContext(oListBinding.getHeaderContext(), "header");

			const sLogLevel = oUriParameters.has("logAsWarning") ? "warning" : "info";
			oListBinding.attachEvent("selectionChanged", (oEvent) => {
				const oContext = oEvent.getParameter("context");
				const iSelectionCount = oContext.getBinding().getSelectionCount();

				Log[sLogLevel](`selectionChanged: $selectionCount = ${iSelectionCount}`, oContext,
					"sap.ui.core.sample.odata.v4.Products.Main");
				MessageToast.show(
					`selectionChanged: $selectionCount = ${iSelectionCount} - ${oContext}`);
			});
		},

		/**
		 * Refreshes the products table.
		 */
		onRefresh() {
			this.byId("ProductList").getBinding("items").refresh();
		},

		/**
		 * Refreshes the products table but all created products keep their position. Filters and
		 * sorters are not applied for created products.
		 */
		onRefreshKeepingPositionOfCreated() {
			this.byId("ProductList").getBinding("items").getHeaderContext()
				.requestSideEffects([""]);
		},

		/**
		 * Requests the selected contexts in the expected order and shows them in a message box.
		 */
		async onRequestSelectedContexts() {
			const aContexts = await this.byId("ProductList").getBinding("items")
				.requestSelectedContexts();
			MessageBox.information(
				aContexts.map((oContext) => oContext.getPath()).join("\n") || "none",
				{title : "Selected Products"});
		},

		/*
		 * Event handler for resetting changes in the products table. Can be used to remove all
		 * created products that could not be saved successfully (for example if product ID is not
		 * unique).
		 */
		onResetChanges() {
			this.byId("ProductList").getBinding("items").resetChanges();
		},

		/**
		 * Shows a message box with the selected products.
		 */
		onShowSelection() {
			const aSelected = this.byId("ProductList").getBinding("items").getAllCurrentContexts()
				.filter((oContext) => oContext.isSelected());
			MessageBox.information((aSelected.join("\n") || "none"),
				{title : "Selected Items"});
		},

		/**
		 * Sorts the product list by product ID.
		 *
		 * @param {string} sProperty The property to sort by
		 */
		onSort(sProperty) {
			const oTable = this.byId("ProductList");
			const oSortColumn = this.byId("column" + sProperty);
			oTable.getColumns().forEach((oColumn) => {
				if (oColumn === oSortColumn) {
					const sCurrentOrder = oColumn.getSortIndicator();
					if (sCurrentOrder === SortOrder.Ascending) {
						oColumn.setSortIndicator(SortOrder.None);
						oTable.getBinding("items").sort();
					} else {
						const bSortDescending = sCurrentOrder === SortOrder.None;
						oColumn.setSortIndicator(
							bSortDescending ? SortOrder.Descending : SortOrder.Ascending);
						oTable.getBinding("items").sort(new Sorter(sProperty, bSortDescending));
					}
				} else {
					oColumn.setSortIndicator(SortOrder.None);
				}
			});
		},

		/*
		 * Helper function to create a new "creation row": creates a new transient row in the
		 * hidden list binding and shows it in the creation row.
		 */
		setNewEntryContext() {
			var oContext = this.oHiddenListBinding.create(oCreationDefaults);

			oContext.created().catch(function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
			});

			this.byId("newEntry").setBindingContext(oContext);
		}
	});
});
