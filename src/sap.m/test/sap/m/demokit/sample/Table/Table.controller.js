sap.ui.define([
		'./Formatter',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Formatter, Controller, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.Table.Table", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onPopinLayoutChanged: function() {
			var oTable = this.byId("idProductsTable");
			var oComboBox = this.byId("idPopinLayout");
			var sPopinLayout = oComboBox.getSelectedKey();
			switch (sPopinLayout) {
				case "Block":
					oTable.setPopinLayout(sap.m.PopinLayout.Block);
					break;
				case "GridLarge":
					oTable.setPopinLayout(sap.m.PopinLayout.GridLarge);
					break;
				case "GridSmall":
					oTable.setPopinLayout(sap.m.PopinLayout.GridSmall);
					break;
				default:
					oTable.setPopinLayout(sap.m.PopinLayout.Block);
					break;
			}
		},

		onSelectionFinish: function(oEvent) {
			var aSelectedItems = oEvent.getParameter("selectedItems");
			var oTable = this.byId("idProductsTable");
			var aSticky = aSelectedItems.map(function(oItem) {
				return oItem.getKey();
			});

			oTable.setSticky(aSticky);
		},

		onToggleInfoToolbar: function(oEvent) {
			var oTable = this.byId("idProductsTable");
			oTable.getInfoToolbar().setVisible(!oEvent.getParameter("pressed"));
		}
	});


	return TableController;

});