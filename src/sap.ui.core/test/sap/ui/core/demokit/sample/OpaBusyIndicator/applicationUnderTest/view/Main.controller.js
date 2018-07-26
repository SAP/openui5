sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Table"
], function (Controller, Table) {
	"use strict";

	var MainController = Controller.extend("view.Main", {
		toggleBusyIndicator: function () {
			var oList = this.byId("myList");
			oList.setBusy(!oList.getBusy());
		}
	});

	return MainController;

});
