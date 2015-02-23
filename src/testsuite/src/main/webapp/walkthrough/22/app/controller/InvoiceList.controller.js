sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/demo/wt/model/formatter", // this formatter is used in the view only
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, formatter, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.ui.demo.wt.controller.InvoiceList", {

		onFilterInvoices : function (oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("ProductName", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("invoiceList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		}
	});

}, /* bExport= */ true);
