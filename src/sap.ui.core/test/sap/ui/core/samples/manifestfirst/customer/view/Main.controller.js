sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var MainController = Controller.extend("samples.manifestfirst.customer.view.Main", {

		onInit : function () {
			this.byId("text").setText("Hello World from Customer");
		}
	
	});

	return MainController;

});
