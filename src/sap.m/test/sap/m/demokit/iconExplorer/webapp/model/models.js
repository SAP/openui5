sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel : function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createSharedParamsModel: function () {
			var currentYear = new Date().getFullYear();
			var oModel = new JSONModel({
				currentYear: currentYear
			});
			return oModel;
		}
	};
});