sap.ui.controller("sap.m.sample.ToolbarEnabled.Toolbar", {
	onCheckBoxSelect: function (oEvent) {
		var bEnabled = oEvent.getParameter("selected");
		this.getView().byId("toolbar").setEnabled(bEnabled);
	}
});