sap.ui.controller("sap.m.sample.ResponsivePopover.C", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},

	onExit : function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
	},

	handleResponsivePopoverPress: function (oEvent) {
		if (! this._oPopover) {
			this._oPopover = sap.ui.xmlfragment("sap.m.sample.ResponsivePopover.Popover", this);
		}
		this._oPopover.setModel(this.getView().getModel());
		this._oPopover.bindElement("/ProductCollection/0");
		this._oPopover.openBy(oEvent.getSource());
	},

	handleCloseButton: function (oEvent) {
		this._oPopover.close();
	}
});
