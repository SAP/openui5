sap.ui.controller("sap.m.sample.MultiInputMultiLine.Page", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
		var oView = this.getView();
			
		var oMultiInput1 = oView.byId("multiInput1");
		oMultiInput1.setTokens([
		                        new sap.m.Token({text: "Token 1", key: "0001"}),
				   			    new sap.m.Token({text: "Token 2", key: "0002"}),
				   			    new sap.m.Token({text: "Token 3", key: "0003"}),
				   			    new sap.m.Token({text: "Token 4", key: "0004"}),
				   			    new sap.m.Token({text: "Token 5", key: "0005"}),
				   			    new sap.m.Token({text: "Token 6", key: "0006"})
				   			    ]);
			
		//*** add checkbox validator
		oMultiInput1.addValidator(function(args){
				var text = args.text;
				return new sap.m.Token({key: text, text: text});
		});
		
		
		var oMultiInput2 = oView.byId("multiInput2");
		//*** add checkbox validator
		oMultiInput2.addValidator(function(args){
			var key = args.suggestionObject.getCells()[0].getText();
			var text = key + "("+args.suggestionObject.getCells()[3].getText()+")";
		
			return new sap.m.Token({key: key, text: text});
		});
		
		var oMultiInput3 = oView.byId("multiInput3");
		var fValidator = function(args){
			window.setTimeout(function(){
				args.asyncCallback(new sap.m.Token({text: args.text}));
			},500);
			return sap.m.MultiInput.WaitForAsyncValidation;
		};
		
		oMultiInput3.addValidator(fValidator);
	}
});