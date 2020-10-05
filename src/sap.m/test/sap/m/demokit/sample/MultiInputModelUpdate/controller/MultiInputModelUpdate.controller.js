sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/Token'
	], function(Controller, JSONModel, Token) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiInputModelUpdate.controller.MultiInputModelUpdate", {

		_textFormatter: function (sString) {
			return "text: " + sString;
		},

		_keyFormatter: function (sString) {
			return "key: " + sString;
		},

		onInit: function () {
			var oView = this.getView();
			// set a model on the sample that will be updated
			var oModel = new JSONModel({
				items: []
			});
			oView.setModel(oModel);

			var oMultiInput = oView.byId("multiInput");

			// add validator
			var fnValidator = function(args){
				var text = args.text;
				return new Token({key: text, text: text});
			};
			oMultiInput.addValidator(fnValidator);

			// modify the model upon adding or removing tokens
			oMultiInput.attachTokenUpdate(function (oEvent) {
				var sType = oEvent.getParameter("type"),
					aAddedTokens = oEvent.getParameter("addedTokens"),
					aRemovedTokens = oEvent.getParameter("removedTokens"),
					aContexts = oModel.getData()["items"];

				switch (sType) {
					// add new context to the data of the model, when new token is being added
					case "added" :
						aAddedTokens.forEach(function (oToken) {
							aContexts.push({key: oToken.getKey(), text: oToken.getText() });
						});
						break;
					// remove contexts from the data of the model, when tokens are being removed
					case "removed" :
						aRemovedTokens.forEach(function (oToken) {
							aContexts = aContexts.filter(function (oContext) {
								return oContext.key !== oToken.getKey();
							});
						});
						break;
					default: break;
				}

				oModel.setProperty("/items", aContexts);
			});
		}
	});
});
