sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.Menu.C", {

		handleOpen: function (oEvent) {
			var Menu = this.getView().byId("helloMenu");
			Menu.showAt(oEvent.oSource);
		},

		handleClose: function () {
			var oMenu = this.getView().byId("helloMenu");
			oMenu.close();
		},

		handleItemClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("You clicked menu item with text: " + oEvent.getParameter("text"));
			demoToast.show();
		}

	});
});