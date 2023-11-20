sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableMultiSelectMode.Table", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onSelectionChange: function(oEvent) {
			var oComboBox = this.getView().byId("idComboBoxSuccess");
			var oTable = this.getView().byId("idProductsTable");
			var sMode = oComboBox.getSelectedKey();
			if (sMode != "") {
				oTable.setMultiSelectMode(sMode);
			}
		}
	});

	return TableController;

});