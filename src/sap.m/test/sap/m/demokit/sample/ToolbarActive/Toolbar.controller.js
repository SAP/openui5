sap.ui.define(['sap/m/MessageToast','sap/ui/core/mvc/Controller'],
	function(MessageToast, Controller) {
	"use strict";

	var ToolbarController = Controller.extend("sap.m.sample.ToolbarActive.Toolbar", {
		onCheckBoxSelect: function (oEvent) {
			var bActive = oEvent.getParameter("selected");
			this.getView().byId("toolbar").setActive(bActive);
		},
		onIconPress: function (evt) {
			MessageToast.show("Icon is pressed");
		},
		onToolbarPress: function (evt) {
			MessageToast.show("Toolbar is pressed");
		}
	});

	return ToolbarController;

});
