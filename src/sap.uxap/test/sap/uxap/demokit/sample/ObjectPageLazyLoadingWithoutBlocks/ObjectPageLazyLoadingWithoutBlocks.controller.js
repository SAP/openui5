sap.ui.define([	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageLazyLoadingWithoutBlocks.ObjectPageLazyLoadingWithoutBlocks", {
		onInit: function (oEvent) {
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/supplier.json"));
			this.getView().setModel(oModel);
			this.getView().bindElement("/SupplierCollection/0");
		}
	});
}, true)
