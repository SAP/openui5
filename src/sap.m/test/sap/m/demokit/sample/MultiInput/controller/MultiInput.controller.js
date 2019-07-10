sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'sap/m/Token'
	], function(Controller, JSONModel, Token) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiInput.controller.MultiInput", {

		onInit: function () {
			var oView = this.getView();
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			oView.setModel(oModel);

			var oMultiInput1 = oView.byId("multiInput2");
			oMultiInput1.setTokens([
				new Token({text: "Token 1", key: "0001"}),
				new Token({text: "Token 2", key: "0002"}),
				new Token({text: "Token 3", key: "0003"}),
				new Token({text: "Token 4", key: "0004"}),
				new Token({text: "Token 5", key: "0005"}),
				new Token({text: "Token 6", key: "0006"})
			]);

			// add validator
			oMultiInput1.addValidator(function(args){
				var text = args.text;

				return new Token({key: text, text: text});
			});
		}
	});
});