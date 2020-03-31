sap.ui.define([
	"sap/ui/core/LocaleData",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (LocaleData, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.TypeDateTimeAsString.C", {

		_data : {
			"dtValue" : new Date()
		},

		onInit : function (evt) {
			var oLocale = sap.ui.getCore().getConfiguration().getLocale(),
				oLocaleData = new LocaleData(oLocale),
				oModel;

			this._data["dtPattern"] = oLocaleData.getCombinedDateTimePattern("medium", "medium");
			oModel = new JSONModel(this._data);
			this.getView().setModel(oModel);
		}
	});
});
