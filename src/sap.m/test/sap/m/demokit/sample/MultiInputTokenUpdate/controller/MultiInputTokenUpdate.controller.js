sap.ui.define([
		'sap/m/Tokenizer',
		'sap/ui/core/mvc/Controller',
		"sap/m/MessageToast",
		"sap/m/Token",
		"sap/base/Log",
		"sap/m/MultiInput"
	], function(Tokenizer, Controller, MessageToast, Token, Log, MultiInput) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiInputTokenUpdate.controller.MultiInputTokenUpdate", {

		onInit: function() {
			var oMultiInput = this.byId('tokenUpdateMI');

			oMultiInput.addValidator(this._multiInputValidator);
		},

		_multiInputValidator: function(args) {
			switch (args.text) {
				case "c":
				case "d":
					return new Token({ key : args.text, text : args.text});
				case "e":
					return new Token({ key : "f", text : "f"});
				case "a":
					setTimeout(function() {
						var oToken = new Token({key: "a", text: "a"});
						args.asyncCallback(oToken);
					}, 3000);
					break;
				case "b":
					setTimeout(function() {
						args.asyncCallback(null);
					}, 5000);
					break;
				case "f":
					setTimeout(function() {
						var oToken = new Token({key: "f", text: "f"});
						args.asyncCallback(oToken);
					}, 10000);
					break;
				default:
			}

			return MultiInput.WaitForAsyncValidation;
		},

		_onTokenChange: function() {
			Log.debug("here");
		},

		_onTokenUpdate: function(oEvent) {
			var aTokens,
				sTokensText = "",
				i;

			if (oEvent.getParameter('type') === Tokenizer.TokenUpdateType.Added) {
				aTokens = oEvent.getParameter('addedTokens');

				sTokensText = "Added tokens: ";
			} else if (oEvent.getParameter('type') === Tokenizer.TokenUpdateType.Removed) {
				aTokens = oEvent.getParameter('removedTokens');

				sTokensText = "Removed tokens: ";
			}

			for (i = 0; i < aTokens.length; i++) {
				sTokensText += '"' + aTokens[i].getText() + '"';

				if (i < aTokens.length - 1) {
					sTokensText += ", ";
				}
			}

			if (aTokens.length > 0) {
				MessageToast.show(sTokensText);
			}
		}
	});
});
