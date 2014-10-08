sap.ui.jsfragment("testdata.customizing.customer.JSCustomFragWithCustomAction", {

	createContent : function(oController) {
		var oButton = new sap.ui.commons.Button("buttonWithCustomerAction", {
			text : "Hello World",
			press : oController.customerAction
		});
		return oButton;
	}

});