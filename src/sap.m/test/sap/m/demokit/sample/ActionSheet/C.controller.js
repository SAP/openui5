sap.ui.controller("sap.m.sample.ActionSheet.C", {
	handleOpen : function (oEvent) {
		var oButton = oEvent.getSource();

		// create action sheet only once
		if (!this._actionSheet) {
			this._actionSheet = sap.ui.xmlfragment(
				"sap.m.sample.ActionSheet.ActionSheet",
				this
			);
			this.getView().addDependent(this._actionSheet);
		}

		this._actionSheet.openBy(oButton);
	}
});