sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'./Formatter',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Formatter, Fragment, Controller, Filter, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.TableSelectDialogGrowing.C", {

		onInit : function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);
		},

		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleTableSelectDialogPress: function(oEvent) {
			if (!this._oDialog || !this._oTable) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.TableSelectDialogGrowing.Dialog", this);
			}

			// check growing
			var bGrowing = !!oEvent.getSource().data("growing");
			this._oDialog.setGrowing(bGrowing);

			this.getView().addDependent(this._oDialog);

			this._oDialog.open();
		},

		handleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleClose: function(oEvent) {
			this._oDialog.destroy();
		}
	});


	return CController;

});
