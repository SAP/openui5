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
	},

	handleConfirmMessageBoxPress_InitialFocus: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.confirm(
				"Initial button focus is set by attribute \n initialFocus: sap.m.MessageBox.Action.CANCEL",
				{
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Set initial button focus",
					styleClass: bCompact? "sapUiSizeCompact" : "",
					initialFocus: sap.m.MessageBox.Action.CANCEL
				}
		);
	},

	handleShowMessageBoxPress_InitialFocus: function(oEvent) {
		var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
		sap.m.MessageBox.show(
				'Initial button focus is set by attribute \n initialFocus: \"Custom button text\" \n Note: The name is not case sensitive',
				{
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "Set initial button focus",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO, "Custom button text"],
					styleClass: bCompact? "sapUiSizeCompact" : "",
					initialFocus: "Custom button text"
				}
		);
	}
});
