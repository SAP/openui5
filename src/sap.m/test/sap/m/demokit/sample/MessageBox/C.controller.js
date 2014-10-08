jQuery.sap.require("sap.m.MessageBox");

sap.ui.controller("sap.m.sample.MessageBox.C", {

	handleConfirmationMessageBoxPress: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
			"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.", {
				icon: sap.m.MessageBox.Icon.QUESTION,
				title: "Really Do This?",
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				styleClass: bCompact? "sapUiSizeCompact" : ""
			}
		);
	},

	handleAlertMessageBoxPress: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.alert(
			"Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod.",
			{
				styleClass: bCompact? "sapUiSizeCompact" : ""
			}
		);
	}
});
