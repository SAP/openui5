/*******************************************************************************
 * Note: This file intentionally contains errors for illustration purposes!    *
 *  The Troubleshooting Tutorial in the official UI5 documentation will show   *
 *  how to analyze and debug them with the support tools delivered by UI5.     *
 ******************************************************************************/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageToast',
	'sap/ui/ux3/NavigationBar',
	'jquery.sap.global'
], function(Controller, MessageToast, NavigationBar, jQuery) {
	"use strict";

	return Controller.extend("sap.ui.demo.HeapOfShards.controller.App", {

		onPress: function (evt) {
			var sMessage="Sorry, an error occurred!";
			try{
				sMessage=evt.getSourceXYZ().getId() + " Pressed";
			} catch (oException){
				jQuery.sap.log.error(oException.stack);
			}
			MessageToast.show(sMessage);
		}
	});
});