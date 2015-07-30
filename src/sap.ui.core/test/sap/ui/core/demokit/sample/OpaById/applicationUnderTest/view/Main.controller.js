sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var MainController = Controller.extend("view.Main", {

		onNavButtonPress : function () {
			this.byId("myApp").to(this.byId("secondPage").getId());
		}

	});

	return MainController;

});
