sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var GridController = Controller.extend("sap.ui.layout.sample.GridInfo.Grid", {

		onInit: function () {
			// set mock model
			var sPath = sap.ui.require.toUrl("sap/ui/layout/sample/GridInfo") + "/persons.json";
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
		}
	});


	return GridController;

});