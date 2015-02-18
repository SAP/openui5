sap.ui.controller("sap.m.sample.ViewSettingsDialogCustomTabs.C", {

	onExit : function () {
		if (this._oDialog) {
			this._oDialog.destroy();
		}
		if (this._oDialogSingleCustomTab) {
			this._oDialogSingleCustomTab.destroy();
		}
	},

	handleOpenDialog: function (oEvent) {
		if (this._oDialogSingleCustomTab) {
			this._oDialogSingleCustomTab.destroy();
			this._oDialogSingleCustomTab = null;
		}
		if (! this._oDialog) {
			this._oDialog = sap.ui.xmlfragment("sap.m.sample.ViewSettingsDialogCustomTabs.Dialog", this);
		}
		this._oDialog.setModel(this.getView().getModel());
		// toggle compact style
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		this._oDialog.open();
	},

	handleOpenDialogSingleCustomTab: function (oEvent) {
		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}
		if (! this._oDialogSingleCustomTab) {
			this._oDialogSingleCustomTab = sap.ui.xmlfragment("sap.m.sample.ViewSettingsDialogCustomTabs.DialogSingleCustomTab", this);
		}

		this._oDialogSingleCustomTab.setModel(this.getView().getModel());
		// toggle compact style
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogSingleCustomTab);
		this._oDialogSingleCustomTab.open();
	},

	handleConfirm: function (oEvent) {
		if (oEvent.getParameters().filterString) {
			sap.m.MessageToast.show(oEvent.getParameters().filterString);
		}
	}
});
