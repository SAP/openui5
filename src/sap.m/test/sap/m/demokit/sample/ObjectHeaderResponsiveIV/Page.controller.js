sap.ui.controller("sap.m.sample.ObjectHeaderResponsiveIV.Page", {

	onInit: function() {
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	onPress: function (evt) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.alert("Link was clicked!");
	},

	onExit : function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
	},

	_getPopover : function () {
		if (!this._oPopover) {
			this._oPopover = sap.ui.xmlfragment("sap.m.sample.ObjectHeaderResponsiveIV.Popover", this);
		}
		return this._oPopover;
	},

	handleTitlePress : function (oEvent) {
		var domRef = oEvent.getParameter("domRef");
		this._getPopover().openBy(domRef);
	}
});
