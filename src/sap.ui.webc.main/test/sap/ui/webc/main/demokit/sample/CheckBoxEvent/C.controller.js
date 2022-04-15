sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.CheckBoxEvent.C", {

		handleChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event change fired. CheckBoxEvent Selected: " + oEvent.getSource().getChecked());
			demoToast.show();
		}

	});
});