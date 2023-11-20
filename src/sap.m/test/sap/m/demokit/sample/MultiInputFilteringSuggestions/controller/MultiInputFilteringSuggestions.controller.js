sap.ui.define(['sap/m/Token', 'sap/m/MessageToast', 'sap/ui/core/Popup', 'sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(Token, MessageToast, Popup, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiInputFilteringSuggestions.controller.MultiInputFilteringSuggestions", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel("test-resources/sap/ui/documentation/sdk/products.json");
			var oView = this.getView();
			oView.setModel(oModel);

			var oMultiInput2 = oView.byId("multiInput2");
			// add checkbox validator
			oMultiInput2.addValidator(function(args){
				if (args.suggestionObject){
					var key = args.suggestionObject.getCells()[0].getText();
					var text = key + "(" + args.suggestionObject.getCells()[3].getText() + ")";

					return new Token({key: key, text: text});
				}
				return null;
			});

			var oMultiInput3 = oView.byId("multiInput3");
			oMultiInput3.addValidator(function(args){
				if (args.suggestionObject){
					var key = args.suggestionObject.getCells()[0].getText();
					var text = key + "(" + args.suggestionObject.getCells()[3].getText() + ")";

					return new Token({key: key, text: text});
				}
				return null;
			});
		},

		handleFormattedTextLinkPress: function(oEvent) {
			oEvent.preventDefault();
			MessageToast.show('You have pressed a link in value state message',
				{
					my: Popup.Dock.CenterCenter,
					at: Popup.Dock.CenterCenter
				}
			);
		}
	});
});
