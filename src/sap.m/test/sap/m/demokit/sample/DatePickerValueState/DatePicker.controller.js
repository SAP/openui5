sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.DatePickerValueState.DatePicker", {

		onInit: function () {
			var oModel,
				sText = "DatePicker with valueState ",
				aData = [
					{ label: sText + "None", valueState: "None"},
					{ label: sText + "Information", valueState: "Information"},
					{ label: sText + "Success", valueState: "Success"},
					{ label: sText + "Warning", valueState: "Warning"},
					{ label: sText + "Error", valueState: "Error"}
				];
			oModel = new JSONModel({
				modelData: aData
			});
			this.getView().setModel(oModel);
		}
	});

});
