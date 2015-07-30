sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/table/sample/TableExampleUtils",
	"sap/m/MessageToast"
], function(Controller, TableExampleUtils, MessageToast) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.Basic.Controller", {
		
		onInit : function () {
			// set explored app's demo model on this sample
			var oJSONModel = TableExampleUtils.initSampleDataModel();
			this.getView().setModel(oJSONModel);
		},
		
		handleDetailsPress : function(oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		}
		
	});

});
