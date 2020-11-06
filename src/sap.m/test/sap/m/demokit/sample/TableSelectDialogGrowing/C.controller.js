sap.ui.define([
	"./Formatter",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel"
], function (Formatter, Fragment, Controller, Filter, FilterOperator, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.TableSelectDialogGrowing.C", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		formatter: Formatter,

		handleTableSelectDialogPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.TableSelectDialogGrowing.Dialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}
			this._pDialog.then(function(oDialog){
				// Set growing if required
				var bGrowing = !!oButton.data("growing");
				oDialog.setGrowing(bGrowing);
				oDialog.open();
			});
		},

		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		}
	});
});