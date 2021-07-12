sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function (Controller, Fragment, syncStyleClass, JSONModel, Filter, FilterOperator, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.SelectDialogLazyLoading.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onOpenDialogPress: function (oEvent) {
			var oView = this.getView();

			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.SelectDialogLazyLoading.Dialog",
					controller: this
				}).then(function (oDialog){
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		}
	});
});