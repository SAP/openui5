sap.ui.define([
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator',
		'sap/ui/model/json/JSONModel'
	], function(Fragment, Controller, Filter, FilterOperator, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.InputStates.C", {
		inputId: '',

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		handleValueHelp : function (oEvent) {
			var oView = this.getView();
			this.inputId = oEvent.getSource().getId();

			// create value help dialog
			if (!this._pValueHelpDialog) {
				this._pValueHelpDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.InputStates.Dialog",
					controller: this
				}).then(function(oValueHelpDialog){
					oView.addDependent(oValueHelpDialog);
					return oValueHelpDialog;
				});
			}

			this._pValueHelpDialog.then(function(oValueHelpDialog){
				// open value help dialog
				oValueHelpDialog.open();
			});
		},

		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"Name",
				FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		}
	});


	return CController;

});