sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.DisplayListItem.List", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/supplier.json"));
			this.getView().setModel(oModel);
		}
	});


	return ListController;

});