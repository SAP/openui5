sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.InputGrouping.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			// the default limit of the model is set to 100. We want to show all the entries.
			oModel.setSizeLimit(100000);
			this.getView().setModel(oModel);
		}

	});
});