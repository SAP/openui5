sap.ui.define(['sap/m/MessageToast','sap/ui/core/mvc/Controller'],
	function(MessageToast, Controller) {
	"use strict";

	var ToolbarController = Controller.extend("sap.m.sample.toolbarActive.Controller", {
		onCheckBoxSelect: function (oEvent) {
			var bActive = oEvent.getParameter("selected");
			this.byId("toolbar").setActive(bActive);
			this.byId("toolbarTitle").setText("Toolbar with active property set to " + bActive);
		},
		onToolbarPress: function (evt) {
			MessageToast.show("OverflowToolbar is clicked");
		}
	});

	return ToolbarController;

});
