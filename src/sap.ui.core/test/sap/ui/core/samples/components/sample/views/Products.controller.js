sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	return Controller.extend("samples.components.sample.views.Products", {

		onShowPress: function(oEvent) {
			alert(oEvent.getSource().getText());
		}

	});

});
