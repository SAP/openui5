sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.TreeMultiSelect.C", {

		handleItemToggle: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemToggle fired.");
			demoToast.show();
		}

	});
});