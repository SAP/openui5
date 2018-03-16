sap.ui.define(['sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.InputValueUpdate.C", {

		onInit: function () {
			var oModel = new JSONModel({data: {}});
			this.getView().setModel(oModel);
		},

		handleLiveChange: function(oEvent) {
			var newValue = oEvent.getParameter("value");
			this.byId('getValue').setText(newValue);
		}
	});

	return CController;

});
