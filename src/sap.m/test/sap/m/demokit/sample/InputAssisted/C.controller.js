sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Fragment, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.m.sample.InputAssisted.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			// The default limit of the model is set to 100. We want to show all the entries.
			oModel.setSizeLimit(100000);
			this.getView().setModel(oModel);
		},

		onValueHelpRequest: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "sap.m.sample.InputAssisted.ValueHelpDialog",
					controller: this
				}).then(function (oFragment) {
					this._oValueHelpDialog = oFragment;
					this.getView().addDependent(this._oValueHelpDialog);

					// Create a filter for the binding
					this._oValueHelpDialog.getBinding("items")
						.filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
					// Open ValueHelpDialog filtered by the input's value
					this._oValueHelpDialog.open(sInputValue);
				}.bind(this));
			} else {
				// Create a filter for the binding
				this._oValueHelpDialog.getBinding("items")
					.filter([new Filter("Name", FilterOperator.Contains, sInputValue)]);
				// Open ValueHelpDialog filtered by the input's value
				this._oValueHelpDialog.open(sInputValue);
			}
		},

		onValueHelpSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);

			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			oEvent.getSource().getBinding("items").filter([]);

			if (!oSelectedItem) {
				return;
			}

			this.byId("productInput").setValue(oSelectedItem.getTitle());
		}

	});
});