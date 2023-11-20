sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var MainController = Controller.extend("samples.manifestfirst.customer.view.Inner", {

		onInit : function () {
			this.byId("textInner1").setText("Text set by Main Controller of Customer Enhancement");

			if (this.getOwnerComponent().getManifestEntry("sap.app").text){
				this.byId("buttonInner1").setText(this.getOwnerComponent().getManifestEntry("sap.app").text);
			}
		}

	});

	return MainController;

});
