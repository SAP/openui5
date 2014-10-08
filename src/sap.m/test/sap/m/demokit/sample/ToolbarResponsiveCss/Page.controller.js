sap.ui.controller("sap.m.sample.ToolbarResponsiveCss.Page", {
	onOpen: function (oEvent) {
		var oButton = oEvent.oSource;

		if (!this._actionSheet) {
			this._actionSheet = sap.ui.xmlfragment("sap.m.sample.ToolbarResponsiveCss.ActionSheet", this);
			this.getView().addDependent(this._actionSheet);
		}

		this._actionSheet.openBy(oButton);
	},

	onPress: function (oEvent) {
		sap.m.MessageToast.show(oEvent.oSource.getText());
	}
});