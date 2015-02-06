sap.ui.controller("sap.m.sample.ObjectHeaderTitleActive.C", {

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

	_getPopover : function () {
		if (!this._oPopover) {
			this._oPopover = sap.ui.xmlfragment("sap.m.sample.ObjectHeaderTitleActive.Popover", this);
		}
		return this._oPopover;
	},

	handleTitlePress : function (oEvent) {
		var domRef = oEvent.getParameter("domRef");
		this._getPopover().openBy(domRef);
	}
});
