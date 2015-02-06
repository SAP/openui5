sap.ui.controller("sap.m.sample.ObjectHeaderTitleSel.C", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		oModel.setDefaultBindingMode("OneWay");
		this.getView().setModel(oModel);
	},

	onExit : function () {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
	},

	_getResponsivePopover: function () {
		if (! this._oPopover) {
			that = this;
			this._oPopover = sap.ui.xmlfragment("sap.m.sample.ObjectHeaderTitleSel.Popover", this);
		}
		return this._oPopover;
	},

	handleItemSelect: function (oEvent) {
		var oItem = oEvent.getParameter("listItem");
		var oObjectHeader = this.getView().byId("idObjectHeader");
		oObjectHeader.setTitle(oItem.getTitle());
		oObjectHeader.setBindingContext(oItem.getBindingContext());
		this._oPopover.close();
	},

	handleTitleSelectorPress: function (oEvent) {
		var _oPopover = this._getResponsivePopover();
		_oPopover.openBy(oEvent.getParameter("domRef"));
		_oPopover.setModel(oEvent.getSource().getModel());
	}

});
