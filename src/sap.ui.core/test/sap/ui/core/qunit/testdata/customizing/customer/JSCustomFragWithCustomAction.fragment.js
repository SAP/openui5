sap.ui.define(['sap/ui/commons/Button', 'sap/ui/core/Fragment'],
	function(Button, Fragment) {
	"use strict";

	sap.ui.jsfragment("testdata.customizing.customer.JSCustomFragWithCustomAction", {

		createContent : function(oController) {
			var oButton = new Button("buttonWithCustomerAction", {
				text : "Hello World",
				press : oController.customerAction
			});
			return oButton;
		}

	});

});
