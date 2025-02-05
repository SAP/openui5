sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/m/Tokenizer",
	"sap/m/Token"
], function (Controller, MessageToast, Tokenizer, Token) {
	"use strict";

	return Controller.extend("sap.m.sample.TokenizerBasic.C", {
		onAddToken: function () {
			var oInput = this.getView().byId("tokenInput");
			var sTokenText = oInput.getValue() || "One more token";

			if (sTokenText) {
				var oTokenizer = this.getView().byId("tokenizer");
				oTokenizer.addToken(new Token({ text: sTokenText, key: sTokenText }));
				oInput.setValue(""); // Clear input field
				MessageToast.show("Token added: " + sTokenText);
			} else {
				MessageToast.show("Please enter a token text.");
			}
		},

		onTokenDelete: function (oEvent) {
			var aDeletedTokens = oEvent.getParameter("tokens");
			var oTokenizer = this.getView().byId("tokenizer");

			aDeletedTokens.forEach(function (oToken) {
				MessageToast.show("Token deleted: " + oToken.getText());
				oTokenizer.removeToken(oToken);
			});
		},

		onSelect: function (oEvent) {
			var oTokenizer = this.getView().byId("tokenizer");
			oTokenizer.setEditable(!oTokenizer.getEditable());
		}
	});
});