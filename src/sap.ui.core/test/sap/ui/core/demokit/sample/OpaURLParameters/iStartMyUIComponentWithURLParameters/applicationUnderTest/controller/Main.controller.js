sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.sample.appUnderTest.controller.Main", {
		onInit: function () {
			setTimeout(function () {
				var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
				this.getView().setModel(oModel);
			}.bind(this), 2000);
		}
	});

});