sap.ui.define([
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (UI5Date, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeDateAsString.C", {

		_data : {
			// current date in "yyyy-MM-dd" format
			date: UI5Date.getInstance().toISOString().slice(0, 10)
		},

		onInit : function (evt) {
			var oModel = new JSONModel(this._data);
			this.getView().setModel(oModel);
		}
	});
});
