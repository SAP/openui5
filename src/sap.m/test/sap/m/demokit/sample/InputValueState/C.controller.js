sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/Popup"
], function (Controller, MessageToast, Popup) {
	"use strict";

	return Controller.extend("sap.m.sample.InputValueState.C", {

		onFormattedTextLinkPress: function (oEvent) {
			oEvent.preventDefault();
			MessageToast.show('You have pressed a link in value state message', {
				my: Popup.Dock.CenterCenter,
				at: Popup.Dock.CenterCenter
			});
		}
	});
});