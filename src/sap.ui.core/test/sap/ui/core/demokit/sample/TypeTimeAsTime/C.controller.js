sap.ui.define([
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (UI5Date, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeTimeAsTime.C", {

		_data : {
			time: UI5Date.getInstance()
		},

		onInit : function () {
			var oModel = new JSONModel(this._data);
			this.getView().setModel(oModel);
		}
	});
});
