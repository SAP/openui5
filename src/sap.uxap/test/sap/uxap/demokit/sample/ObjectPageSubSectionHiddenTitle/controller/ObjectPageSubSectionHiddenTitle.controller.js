sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel'
], function ( Controller, JSONModel) {
	"use strict";


	return Controller.extend("sap.uxap.sample.ObjectPageSubSectionHiddenTitle.controller.ObjectPageSubSectionHiddenTitle", {

			onInit: function () {

				// set explored app's demo model on this sample
				var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
				this.getView().setModel(oModel);
			},

			weightState :  function (fValue) {

				var parsedValue = parseFloat(fValue);

				if (Number.isNaN(parsedValue) || parsedValue < 0 ) {
					return "None";
				} else if (parsedValue < 1000) {
					return "Success";
				} else if (parsedValue < 2000) {
					return "Warning";
				} else {
					return "Error";
				}
			}
	});

});

