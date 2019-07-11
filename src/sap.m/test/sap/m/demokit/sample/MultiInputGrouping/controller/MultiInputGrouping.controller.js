sap.ui.define([
		'sap/m/Token',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Token, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.MultiInputGrouping.controller.MultiInputGrouping", {

		/**
		 * Lifecycle hook that is called when the controller is instantiated
		 */
		onInit: function () {
			// set explored app's demo model on this sample
			var oView = this.getView(),
				oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			// the default limit of the model is set to 100. We want to show all the entries.
			oModel.setSizeLimit(1000000);
			oView.setModel(oModel);

			var oMultiInputWithTable = oView.byId("productMIWithTable");
			// add checkbox validator
			oMultiInputWithTable.addValidator(function(args){
				if (args.suggestionObject){
					var key = args.suggestionObject.getCells()[0].getText();
					var text = key + "(" + args.suggestionObject.getCells()[3].getText() + ")";

					return new Token({key: key, text: text});
				}
				return null;
			});
		}
	});

});
