sap.ui.define(['sap/m/MessageToast','sap/ui/core/mvc/Controller'],
	function(MessageToast, Controller) {
	"use strict";

	var ToolbarController = Controller.extend("sap.m.sample.ToolbarActive.Toolbar", {
		onCheckBoxSelect: function (oEvent) {
			var bActive = oEvent.getParameter("selected");
			this.byId("toolbar").setActive(bActive);
		},
		onToolbarPress: function (evt) {
			MessageToast.show("OverflowToolbar is clicked");
		}
	});

	return ToolbarController;

});
