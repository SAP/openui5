sap.ui.controller("sap.m.sample.ToolbarActive.Toolbar", {
	onCheckBoxSelect: function (oEvent) {
		var bActive = oEvent.getParameter("selected");
		this.getView().byId("toolbar").setActive(bActive);
	},
	onIconPress: function (evt) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("Icon is pressed");
	},
	onToolbarPress: function (evt) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("Toolbar is pressed");
	}
});