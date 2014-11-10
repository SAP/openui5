sap.ui.controller("sap.m.sample.ObjectHeaderResponsiveIII.Page", {

	onInit: function() {
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},
	
	onExit : function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
	},

	_getPopover : function () {
		if (!this._oPopover) {
			this._oPopover = sap.ui.xmlfragment("sap.m.sample.ObjectHeaderResponsiveIII.Popover", this);
		}
		return this._oPopover;
	},

	handleTitlePress : function (oEvent) {
		var domRef = oEvent.getParameter("domRef");
		this._getPopover().openBy(domRef);
	}
});