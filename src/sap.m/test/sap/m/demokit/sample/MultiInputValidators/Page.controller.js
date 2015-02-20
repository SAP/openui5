sap.ui.controller("sap.m.sample.MultiInputValidators.Page", {

	onInit: function () {
		var oView = this.getView();
		var oMultiInput1 = oView.byId("multiInput1");
		var oMultiInput2 = oView.byId("multiInput2");
		var oCheckBox = oView.byId("checkbox1");

		//*** add checkbox validator
		oMultiInput1.addValidator(function(args){
			if (oCheckBox.getSelected()){
				var text = args.text;
				return new sap.m.Token({key: text, text: text});
			}
		});

		var iValidationCounter = 0;
		//*** add text change validator
		oMultiInput1.addValidator(function(args){
			if (args.suggestedToken){
				var text = args.suggestedToken.getText();
				iValidationCounter++;
				return new sap.m.Token({key: text, text: "#"+ iValidationCounter+": " + text});
			}
		});

		//******* MultiInput 2 - add asynchronous validator
		oMultiInput2.addValidator(function(args){
			  jQuery.sap.require("sap.m.MessageBox");
			  sap.m.MessageBox.confirm("Do you really want to add token \"" + args.text + "\"?", {
				onClose: function(oAction) {
					if (oAction === sap.m.MessageBox.Action.OK){
						var oToken = new sap.m.Token({key: args.text, text: args.text});
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