sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/Fragment'
], function(Controller, Filter, FilterOperator, JSONModel, Fragment) {
"use strict";

var InputCustomValueHelpIconController = Controller.extend("sap.m.sample.InputCustomValueHelpIcon.InputCustomValueHelpIcon", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
		this.getView().setModel(oModel);
	},

	handleValueHelp : function (oEvent) {
		var oView = this.getView();
		this._sInputId = oEvent.getSource().getId();

		// create value help dialog
		if (!this._pValueHelpDialog) {
			this._pValueHelpDialog = Fragment.load({
				id: oView.getId(),
				name: "sap.m.sample.InputCustomValueHelpIcon.Dialog",
				controller: this
			}).then(function(oValueHelpDialog){
				oView.addDependent(oValueHelpDialog);
				return oValueHelpDialog;
			});
		}

		// open value help dialog
		this._pValueHelpDialog.then(function(oValueHelpDialog){
			oValueHelpDialog.open();
		});
	},

	_handleValueHelpSearch : function (oEvent) {
		var sValue = oEvent.getParameter("value");
		var oFilter = new Filter(
			"Name",
			FilterOperator.Contains, sValue
		);
		oEvent.getSource().getBinding("items").filter([oFilter]);
	},

	_handleValueHelpClose : function (oEvent) {
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem) {
			var productInput = this.byId(this._sInputId);
			productInput.setValue(oSelectedItem.getTitle());
		}
		oEvent.getSource().getBinding("items").filter([]);
	}
});

	return InputCustomValueHelpIconController;
});