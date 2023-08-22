/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Messaging",
	"sap/ui/core/sample/common/Controller"
], function (coreLibrary, Messaging, Controller) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	return Controller.extend("sap.ui.core.sample.odata.v4.Products.Main", {
		/* The number of POST requests which are not yet completed */
		iCreates : 0,

		/*
		 * Enable add button if and only if creation row has no invalid user input (and it was not
		 * yet used).
		 */
		enableAddButton : function () {
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
		onAdd : function () {
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
		onClearRow : function () {
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
		onCreateCompleted : function () {
			this.iCreates -= 1;
			if (this.iCreates === 0) {
				this.byId("ProductList").setBusy(false);
			}
		},

		/*
		 * Event handler is called when a POST request for a created entity is sent to the server.
		 * Used to lock the "Products" table to avoid modifications while POST request is running.
		 */
		onCreateSent : function () {
			if (this.iCreates === 0) {
				this.byId("ProductList").setBusy(true);
			}
			this.iCreates += 1;
		},

		/*
		 * Controller's initialization.
		 */
		onInit : function () {
			this.initMessagePopover("messagesButton");

			// set up hidden list binding for creation row
			this.oListBinding = this.getOwnerComponent().getModel()
				.bindList("/ProductList", null, [], [], {$$updateGroupId : "doNotSubmit"});
			// create new "creation row"
			this.setNewEntryContext();
		},

		/*
		 * Event handler for resetting changes in the products table. Can be used to remove all
		 * created products that could not be saved successfully (for example if product ID is not
		 * unique).
		 */
		onResetChanges : function () {
			this.byId("ProductList").getBinding("items").resetChanges();
		},

		/*
		 * Helper function to create a new "creation row": creates a new transient row in the
		 * hidden list binding and shows it in the creation row.
		 */
		setNewEntryContext : function () {
			var oContext = this.oListBinding.create({
					// mandatory properties for new entity which are not available on UI
					Category : "Notebooks",
					MeasureUnit : "EA", // wrong service expectation
					SupplierID : "0100000046",
					TaxTarifCode : 1,
					TypeCode : "PR",
					// some useful defaults
					CurrencyCode : "EUR",
					WeightUnit : "KG"
				});

			oContext.created().catch(function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
			});

			this.byId("newEntry").setBindingContext(oContext);
		}
	});
});
