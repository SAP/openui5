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
			if (!this.oDialog) {
				this.oDialog = sap.ui.xmlfragment("sap.m.sample.TableLayout.Dialog", this);
				this.getView().addDependent(this.oDialog);
			}

			// toggle compact style for the dialog
			syncStyleClass("sapUiSizeCompact", this.getView(), this.oDialog);
			this.oDialog.open();
		},

		onClosePressed: function (oEvent) {
			this.oDialog.close();
		}
	});


	return TableController;

});