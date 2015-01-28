sap.ui.controller("sap.m.sample.ToolbarActive.Toolbar", {
	onCheckBoxSelect: function (oEvent) {
		var bActive = oEvent.getParameter("selected");
		this.getView().byId("toolbar").setActive(bActive);
	},
	onIconPress: function (evt) {
		sap.m.MessageToast.show("Icon is pressed");
	},
	onToolbarPress: function (evt) {
		sap.m.MessageToast.show("Toolbar is pressed");
	}
});