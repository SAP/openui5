/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller"
], function (MessageBox, Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Products.Main", {
		/*
		 * Enable add button if and only if creation row has no invalid user input (and it was not
		 * yet used).
		 */
		enableAddButton : function () {
			var oView = this.getView();

			function isOK(oContent) {
				return !oContent.getValueState || oContent.getValueState() === "None";
			}

			if (this.bCreated) {
				return;
			}

			setTimeout(function () {
				var aContents = oView.byId("newEntry").getContent();

				oView.byId("addButton").setEnabled(aContents.every(isOK));
			}, 0);
		},

		/*
		 * "Add" button's event handler: add new row to table.
		 */
		onAdd : function () {
			var oView = this.getView(),
				oContext = oView.byId("newEntry").getBindingContext(),
				oNewEntry = oContext.getObject();

			oNewEntry["@odata.etag"] = null; // avoid "Failed to drill-down"

			// add new row to table
			oView.byId("ProductList").getBinding("items").create(oNewEntry).created()
				.catch(function (oError) {
					if (!oError.canceled) {
						MessageBox.alert(oError.message);
					}
				});

			// there can only be one created row
			this.bCreated = true;
			oView.byId("addButton").setEnabled(false);

			// clear creation row
			this.onClearRow();
		},

		/*
		 * "Clear row" button's event handler: clear creation row.
		 */
		onClearRow : function () {
			var oView = this.getView(),
				aContents = oView.byId("newEntry").getContent();

			// destroy old "creation row"
			oView.byId("newEntry").getBindingContext().delete("$direct");

			// remove invalid user input, including the corresponding messages
			aContents.forEach(function (oContent) {
				if (oContent.getValueState) {
					oContent.setValue("");
					oContent.setValueState("None");
					sap.ui.getCore().getMessageManager().removeMessages(
						oContent.getBinding("value").getDataState().getMessages());
				}
			});

			// create new "creation row"
			this.setNewEntryContext();

			this.enableAddButton(); // check again
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
		 * Helper function to create a new "creation row": creates a new transient row in the
		 * hidden list binding and shows it in the creation row.
		 */
		setNewEntryContext : function () {
			var oContext = this.oListBinding.create({
					// mandatory properties for new entity which are not available on UI
					"Category" : "Notebooks",
					"MeasureUnit" : "EA", // wrong service expectation
					"SupplierID" : "0100000046",
					"TaxTarifCode" : 1,
					"TypeCode" : "PR",
					// some useful defaults
					"CurrencyCode" : "EUR",
					"WeightUnit" : "KG"
				});

			oContext.created().catch(function (oError) {
				if (!oError.canceled) { // unexpected error
					MessageBox.alert(oError.message);
				}
			});

			this.getView().byId("newEntry").setBindingContext(oContext);
		}
	});
});