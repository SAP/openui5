sap.ui.controller("sap.m.sample.ViewSettingsDialog.C", {

	onExit : function () {
		if (this._oDialog) {
			this._oDialog.destroy();
		}
	},

	handleOpenDialog: function (oEvent) {
		if (! this._oDialog) {
			this._oDialog = sap.ui.xmlfragment("sap.m.sample.ViewSettingsDialog.Dialog", this);
		}
		this._oDialog.setModel(this.getView().getModel());
		// toggle compact style
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		this._oDialog.open();
	},

	handleConfirm: function (oEvent) {
		jQuery.sap.require("sap.m.MessageToast");
		if (oEvent.getParameters().filterString) {
			sap.m.MessageToast.show(oEvent.getParameters().filterString);
		}
	}
});
