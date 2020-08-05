sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/json/JSONModel'
	], function(Controller, Filter, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableOutdated.Table", {

	    onInit: function() {

	        // set explored app's demo model on this sample
	        var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
	        this.getView().setModel(oModel);
	        // reuse table sample component
	        var oComp = sap.ui.getCore().createComponent({
	            name: "sap.m.sample.Table"
	        });
	        oComp.setModel(this.getView().getModel());
	        this._oTable = oComp.getTable();
	        this.byId("tableLayout").insertContent(this._oTable);
	        // update table
	        this._oTable.getHeaderToolbar().setVisible(false);
	    },
	    onChange: function(oEvent) {
	        // getting the value of Combobox
	        this._oTable.setShowOverlay(true);
	    },
	    onReset: function(oEvent) {
	        // resetting the value of Combobox and initial state of the table
	        var oBinding = this._oTable.getBinding("items");
	        oBinding.filter([]);
	        this._oTable.setShowOverlay(false);
	        this.byId("oComboBox").setSelectedItem(null);
	    },
	    onSearch: function(oEvent) {
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