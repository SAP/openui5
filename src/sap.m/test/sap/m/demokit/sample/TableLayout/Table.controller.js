sap.ui.define([
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		"sap/ui/core/syncStyleClass",
		'sap/ui/model/json/JSONModel'
	], function(Fragment, Controller, syncStyleClass, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableLayout.Table", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onCheckBoxSelect: function (oEvent) {
			var bFixedLayout = oEvent.getParameter("selected");
			var oTable = oEvent.getSource().getParent().getParent();
			oTable.setFixedLayout(bFixedLayout);
		},

		onOpenPressed: function (oEvent) {
			var oView = this.getView();
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.TableLayout.Dialog",
					controller: this
				}).then(function(oDialog){
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pDialog.then(function(oDialog){
				// toggle compact style for the dialog
				syncStyleClass("sapUiSizeCompact", oView, oDialog);
				oDialog.open();
			});
		},

		onClosePressed: function (oEvent) {
			this._pDialog.then(function(oDialog){
				oDialog.close();
			});
		}
	});

	return TableController;

});