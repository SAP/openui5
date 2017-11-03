/*******************************************************************************
 * Note: This file intentionally contains errors for illustration purposes!	*
 *  The Troubleshooting Tutorial in the official UI5 documentation will show   *
 *  how to analyze and debug them with the support tools delivered by UI5.	 *
 ******************************************************************************/

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageToast',
	'sap/ui/ux3/NavigationBar',
	'jquery.sap.global'
], function (Controller, MessageToast, NavigationBar, jQuery) {
	"use strict";

	return Controller.extend("sap.ui.demo.HeapOfShards.controller.App", {

		onPress: function (oEvent) {
			var sMessage;
			try {
				sMessage = this.getResourceBundle().getText("buttonOk", [oEvent.getSourceXYZ().getId()]);
			} catch (oException) {
				sMessage = this.getResourceBundle().getText("buttonErrorOccurred");
				jQuery.sap.log.error(oException.stack);
			}
			MessageToast.show(sMessage);
		},

		getResourceBundle: function () {
			if (!this.oBundle) {
				this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			}
			return this.oBundle;
		}

	});
});