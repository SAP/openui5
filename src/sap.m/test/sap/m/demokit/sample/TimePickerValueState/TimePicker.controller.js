sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.TimePickerValueState.TimePicker", {

		onInit: function () {
			var oModel,
				sText = "TimePicker with valueState ",
				aData = [
					{ label: sText + "None", valueState: "None"},
					{ label: sText + "Information", valueState: "Information"},
					{ label: sText + "Success", valueState: "Success"},
					{ label: sText + "Warning and long valueStateText", valueState: "Warning", valueStateText: "Warning message. This is an extra long text used as a warning message. It illustrates how the text wraps into two or more lines without truncation to show the full length of the message."},
					{ label: sText + "Error", valueState: "Error"}
				];
			oModel = new JSONModel({
				modelData: aData
			});
			this.getView().setModel(oModel);
		}
	});

});
