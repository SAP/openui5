sap.ui.jsfragment("testdata.customizing.customer.MultiRootFragment", {

	createContent : function(oController) {
		var aContent = [ new sap.ui.commons.Button(this.createId("customerButton1"),{
			text : "Hello World",

		}), new sap.ui.commons.Button(this.createId("customerButton2"),{
			text : "Hello Button",
		}) ];
		return aContent;
	}

});