/*******************************************************************************
 * Note: This file intentionally contains errors for illustration purposes!	*
 *  The Troubleshooting Tutorial in the official UI5 documentation will show   *
 *  how to analyze and debug them with the support tools delivered by UI5.	 *
 ******************************************************************************/

sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	'sap/base/Log'
], function (Controller, MessageToast, Log) {
	"use strict";

	return Controller.extend("sap.ui.demo.HeapOfShards.controller.App", {

		onPress: function (oEvent) {
			var sMessage;
			try {
				sMessage = this.getResourceBundle().getText("buttonOk", [oEvent.getSourceXYZ().getId()]);
			} catch (oException) {
				sMessage = this.getResourceBundle().getText("buttonErrorOccurred");
				Log.error(oException.stack);
			}
			MessageToast.show(sMessage);
		},

		getResourceBundle: function () {
			return this.getView().getModel("i18n").getResourceBundle();
		}

	});
});
