sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/m/MessageToast'
], function(jQuery, Controller, JSONModel, MessageToast) {
	"use strict";

	var GridController = Controller.extend("sap.ui.layout.sample.GridXL.Grid", {

		onInit: function() {
			// set mock model
			var sPath = sap.ui.require.toUrl("sap/ui/layout/sample/GridXL") + "/information.json";
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
		}
	});

	return GridController;

});