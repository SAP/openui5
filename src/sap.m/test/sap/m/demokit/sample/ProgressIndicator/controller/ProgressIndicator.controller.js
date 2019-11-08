sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.ProgressIndicator.controller.ProgressIndicator", {

		onPIChangeValueButtonPressed : function (oEvent) {
			var sSourceId = oEvent.getSource().getId(),
				sButton = 'button',
				iIndexOfButton = sSourceId.indexOf(sButton),
				oProgressIndicator = this.getView().byId(sSourceId.substring(0, iIndexOfButton - 1)),
				sValue = sSourceId.substring(iIndexOfButton + sButton.length);

			oProgressIndicator.setPercentValue(+sValue);
			oProgressIndicator.setDisplayValue(sValue + '%');
		}

	});
});