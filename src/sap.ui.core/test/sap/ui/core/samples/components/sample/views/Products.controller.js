sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/m/MessageToast'],
	function(Controller, MessageToast) {
	"use strict";

	return Controller.extend("samples.components.sample.views.Products", {

		onShowPress: function(oEvent) {
			MessageToast.show(oEvent.getSource().getText());
		}

	});

});
