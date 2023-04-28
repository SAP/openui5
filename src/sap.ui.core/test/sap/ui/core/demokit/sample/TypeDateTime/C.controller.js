sap.ui.define([
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (UI5Date, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeDateTime.C", {

		_data : {
			dtValue: UI5Date.getInstance(),
			dtPattern: undefined
		},

		onInit : function () {
			var oModel = new JSONModel(this._data);

			this.getView().setModel(oModel);
			oModel.setProperty("/dtPattern",
				this.getView().byId("dtInput").getBinding("value").getType().getPlaceholderText());
		}
	});
});
