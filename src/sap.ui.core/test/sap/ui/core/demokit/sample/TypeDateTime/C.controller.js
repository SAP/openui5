sap.ui.define([
	"sap/ui/core/LocaleData",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Configuration"
], function (LocaleData, Controller, JSONModel, Configuration) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeDateTime.C", {

		_data : {
			"dtValue" : new Date()
		},

		onInit : function () {
			var oLocale = Configuration.getLocale(),
				oLocaleData = new LocaleData(oLocale),
				oModel;

			this._data["dtPattern"] = oLocaleData.getCombinedDateTimePattern("medium", "medium");
			oModel = new JSONModel(this._data);
			this.getView().setModel(oModel);
		}
	});
});
