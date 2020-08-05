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

		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		formatter: Formatter,

		handleTableSelectDialogPress: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oDialog || !this._oTable) {
				Fragment.load({
					name: "sap.m.sample.TableSelectDialogGrowing.Dialog",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;
					this._configDialog(oButton);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog(oButton);
				this._oDialog.open();
			}
		},

		_configDialog: function (oButton) {
			// Set growing if required
			var bGrowing = !!oButton.data("growing");
			this._oDialog.setGrowing(bGrowing);

			this.getView().addDependent(this._oDialog);
		},

		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleClose: function () {
			this._oDialog.destroy();
		}

	});
});