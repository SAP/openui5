sap.ui.define([
	"sap/ui/core/LocaleData",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Configuration"
], function (LocaleData, UI5Date, Controller, JSONModel, Configuration) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeTimeAsTime.C", {

		_data : {
			"time" : UI5Date.getInstance()
		},

		onInit : function () {
			var oLocale = Configuration.getLocale(),
				oLocaleData = new LocaleData(oLocale),
				oModel;

			this._data["dtPattern"] = oLocaleData.getTimePattern("medium");
			oModel = new JSONModel(this._data);
			this.getView().setModel(oModel);
		}
	});
});
