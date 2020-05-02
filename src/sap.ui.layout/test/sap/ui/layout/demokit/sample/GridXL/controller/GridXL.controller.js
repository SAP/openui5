sap.ui.define([
	'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.GridXL.controller.GridXL", {

		onInit: function() {
			// set mock model
			var sPath = sap.ui.require.toUrl("sap/ui/layout/sample/GridXL/information.json");
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
		}
	});
});