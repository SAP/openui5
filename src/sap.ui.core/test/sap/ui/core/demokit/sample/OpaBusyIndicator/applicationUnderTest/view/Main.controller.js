sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var MainController = Controller.extend("view.Main", {
		toggleBusyIndicator: function () {
			var oList = this.byId("myList");
			oList.setBusy(!oList.getBusy());
		}
	});

	return MainController;

});
