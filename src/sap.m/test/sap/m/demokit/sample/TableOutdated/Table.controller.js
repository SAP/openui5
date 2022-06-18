sap.ui.define([
		'sap/ui/core/Component',
		'sap/ui/core/Core',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/json/JSONModel'
	], function(Component, oCore, Controller, Filter, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableOutdated.Table", {

		onInit: function() {
			Component.create({
				name : 'sap.m.sample.Table'
			})
			.then(function(oComp) {
				// set explored app's demo model on this sample
				var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));

				this.getView().setModel(oModel);

				// reuse table sample component, but w/o header toolbar
				oComp.setModel(this.getView().getModel());
				this._oTable = oComp.getTable();
				this._oTable.getHeaderToolbar().setVisible(false);
				this.byId("tableLayout").insertContent(this._oTable);
			}.bind(this));
		},
		onChange: function(oEvent) {
			if ( !this._oTable ) {
				return;
			}
			// getting the value of Combobox
			this._oTable && this._oTable.setShowOverlay(true);
		},
		onReset: function(oEvent) {
			if ( !this._oTable ) {
				return;
			}
			// resetting the value of Combobox and initial state of the table
			var oBinding = this._oTable.getBinding("items");
			oBinding.filter([]);
			this._oTable.setShowOverlay(false);
			this.byId("oComboBox").setSelectedItem(null);
		},
		onSearch: function(oEvent) {
			if ( !this._oTable ) {
				return;
			}
			var comboBoxValue = this.byId("oComboBox").getValue(),
				oBinding = this._oTable.getBinding("items"),
				oFilter;
			if (comboBoxValue || comboBoxValue === "") {
				this._oTable.setShowOverlay(false);
				oFilter = new Filter("SupplierName", "EQ", comboBoxValue);
				oBinding.filter([oFilter]);
			}
		}
	});


	return TableController;

});