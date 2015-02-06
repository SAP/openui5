sap.ui.controller("sap.m.sample.Popover.C", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	onExit : function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
	},

	handlePopoverPress: function (oEvent) {

		// create popover
		if (! this._oPopover) {
			this._oPopover = sap.ui.xmlfragment("sap.m.sample.Popover.Popover", this);
			this.getView().addDependent(this._oPopover);
			this._oPopover.bindElement("/ProductCollection/0");
		}

		// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
		var oButton = oEvent.getSource();
		jQuery.sap.delayedCall(0, this, function () {
			this._oPopover.openBy(oButton);
		});
	},

	handleEmailPress: function (oEvent) {
		this._oPopover.close();
		sap.m.MessageToast.show("E-Mail has been sent");
	}
});
