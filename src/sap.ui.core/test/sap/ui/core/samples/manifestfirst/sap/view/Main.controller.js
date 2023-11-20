sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var MainController = Controller.extend("samples.manifestfirst.sap.view.Main", {

		onInit : function () {
			this.byId("text").setText("Hello World");
		}

	});

	return MainController;

});
