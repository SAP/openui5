sap.ui.define([
	'sap/ui/core/Fragment',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel',
	'sap/m/Token',
	'sap/ui/model/FilterOperator'
], function (Fragment, Controller, Filter, JSONModel, Token, FilterOperator) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiInputValueHelp.controller.MultiInputValueHelp", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			// the default limit of the model is set to 100. We want to show all the entries.
			oModel.setSizeLimit(1000000);
			this.getView().setModel(oModel);
		},

		handleValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue(),
				oView = this.getView();

			// create value help dialog
			if (!this._pValueHelpDialog) {
				this._pValueHelpDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.MultiInputValueHelp.view.Dialog",
					controller: this
				}).then(function (oValueHelpDialog) {
					oView.addDependent(oValueHelpDialog);
					return oValueHelpDialog;
				});
			}

			this._pValueHelpDialog.then(function (oValueHelpDialog) {
				// create a filter for the binding
				oValueHelpDialog.getBinding("items").filter([new Filter(
					"Name",
					FilterOperator.Contains,
					sInputValue
				)]);
				// open value help dialog filtered by the input value
				oValueHelpDialog.open(sInputValue);
			});
		},

		_handleValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Name",
				FilterOperator.Contains,
				sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose: function (evt) {
			var aSelectedItems = evt.getParameter("selectedItems"),
				oMultiInput = this.byId("multiInput");

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						text: oItem.getTitle()
					}));
				});
			}
		}
	});
});