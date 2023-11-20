sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.Carousel.C", {

		handleNavigate: function (oEvent) {
			var oDemoToast = this.getView().byId("demoToast");
			oDemoToast.setText("Event navigate fired.");
			oDemoToast.show();
		}

	});
});