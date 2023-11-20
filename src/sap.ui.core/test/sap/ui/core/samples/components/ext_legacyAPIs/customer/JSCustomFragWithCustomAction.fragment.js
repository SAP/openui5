sap.ui.define(['sap/m/Button', 'sap/ui/core/Fragment'],
	function(Button, Fragment) {
	"use strict";

	sap.ui.jsfragment("samples.components.ext_legacyAPIs.customer.JSCustomFragWithCustomAction", {

		createContent : function(oController) {
			var oButton = new Button({
				text : "Hello World",
				press : oController.customerAction
			});
			return oButton;
		}

	});

});
