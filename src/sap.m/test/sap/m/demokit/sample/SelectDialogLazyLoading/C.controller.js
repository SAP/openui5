sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, Fragment, JSONModel, Filter, FilterOperator) {
	"use strict";

	var oData = {
		productCollection: []
	};

	for (var i = 1; i <= 31; i++) {
		oData.productCollection.push({
			"name": "Name " + i,
			"description": "Description " + i
		});
	}

	return Controller.extend("sap.m.sample.SelectDialogLazyLoading.C", {

		onInit: function () {
			var oModel = new JSONModel(oData);
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
			var oFilter = new Filter("name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},

		onUpdateStarted: function (oEvent) {
			if (oEvent.getParameter("reason") !== "Growing") {
				return;
			}

			// add additional data to the model
			var iIndex = oData.productCollection.length - 1;

			for (var i = iIndex; i < Math.min(iIndex + 30, 1001); i++) {
				oData.productCollection.push({
					"name": "Name " + i,
					"description": "Description " + i
				});
			}

			this.getView().getModel().setData(oData);
		}
	});
});