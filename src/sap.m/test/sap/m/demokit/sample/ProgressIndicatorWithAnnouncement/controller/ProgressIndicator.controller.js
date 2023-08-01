sap.ui.define([
		'sap/ui/core/mvc/Controller',
		"sap/ui/core/InvisibleMessage"
	], function(Controller, InvisibleMessage) {
	"use strict";

	return Controller.extend("sap.m.sample.ProgressIndicatorWithAnnouncement.controller.ProgressIndicator", {

		onPIChangeValueButtonPressed : function (oEvent) {
			var sSourceId = oEvent.getSource().getId(),
				sButton = 'button',
				iIndexOfButton = sSourceId.indexOf(sButton),
				oProgressIndicator = this.getView().byId(sSourceId.substring(0, iIndexOfButton - 1)),
				sValue = sSourceId.substring(iIndexOfButton + sButton.length),
				sPreviousValue = oProgressIndicator.getDisplayValue(),
				sAccText;

			oProgressIndicator.setDisplayValue(sValue + '%');
			oProgressIndicator.setPercentValue(+sValue);

			setTimeout(function () {
				sAccText = "Previous value was " + sPreviousValue + ". New value is " + sValue + "%.";
				InvisibleMessage.getInstance().announce(sAccText);
			});
		}

	});
});