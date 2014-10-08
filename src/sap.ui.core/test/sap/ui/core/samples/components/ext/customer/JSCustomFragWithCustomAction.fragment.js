sap.ui.jsfragment("samples.components.ext.customer.JSCustomFragWithCustomAction", {

	createContent : function(oController) {
		var oButton = new sap.ui.commons.Button({
			text : "Hello World",
			press : oController.customerAction
		});
		return oButton;
	}

});