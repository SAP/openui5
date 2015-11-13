sap.ui.define(['sap/m/MessageBox','sap/m/Token','sap/ui/core/mvc/Controller'],
	function(MessageBox, Token, Controller) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.MultiInputValidators.Page", {

		onInit: function () {
			var oView = this.getView();
			var oMultiInput1 = oView.byId("multiInput1");
			var oMultiInput2 = oView.byId("multiInput2");
			var oCheckBox = oView.byId("checkbox1");

			//*** add checkbox validator
			oMultiInput1.addValidator(function(args){
				if (oCheckBox.getSelected()){
					var text = args.text;
					return new Token({key: text, text: text});
				}
			});

			//*** add text change validator
			oMultiInput1.addValidator(function(args){
				if (args.suggestedToken){
					var text = args.suggestedToken.getText();
					return new Token({key: text, text: "#: " + text});
				}
			});

			//******* MultiInput 2 - add asynchronous validator
			oMultiInput2.addValidator(function(args){
				MessageBox.confirm("Do you really want to add token \"" + args.text + "\"?", {
					onClose: function(oAction) {
						if (oAction === MessageBox.Action.OK){
							var oToken = new Token({key: args.text, text: args.text});
							args.asyncCallback(oToken);
						}
						else{
							args.asyncCallback(null);
						}
					},
					title: "add Token"
					});
				  return sap.m.MultiInput.WaitForAsyncValidation;
			});
		}
	});

	return PageController;

});
