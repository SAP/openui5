sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var ToolbarController = Controller.extend("sap.m.sample.ToolbarEnabled.Toolbar", {
		onCheckBoxSelect: function (oEvent) {
			var bEnabled = oEvent.getParameter("selected");
			this.byId("toolbar").setEnabled(bEnabled);
		}
	});

	return ToolbarController;

});
