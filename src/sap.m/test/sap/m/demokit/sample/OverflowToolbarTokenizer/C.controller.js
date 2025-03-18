sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/Token"
], function (Controller, MessageToast, Token) {
	"use strict";

	return Controller.extend("sap.m.sample.OverflowToolbarTokenizer.C", {
		onInit: function () {

		},
		onAddToken: function () {
			const oInput = this.getView().byId("NewTokenInput");
			const sValue = oInput.getValue();

			if (!sValue.trim()) {
				MessageToast.show("Please enter a token text.");
				return;
			}

			const oOverflowToolbarTokenizer = this.getView().byId("toolbarTokenizer");
			oOverflowToolbarTokenizer.addToken(new Token({ text: sValue, key: sValue }));
			oInput.setValue("");
			MessageToast.show("Token added: " + sValue);
		},

		onTokenDelete: function (oEvent) {
			var aDeletedTokens = oEvent.getParameter("tokens");
			var oTokenizer = oEvent.getSource();

			aDeletedTokens.forEach(function (oToken) {
				MessageToast.show("Token deleted: " + oToken.getText());
				oTokenizer.removeToken(oToken);
			});
		}
	});
});