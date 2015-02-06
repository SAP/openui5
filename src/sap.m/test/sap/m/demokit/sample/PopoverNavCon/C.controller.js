sap.ui.controller("sap.m.sample.PopoverNavCon.C", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	onOpenPopover: function (oEvent) {

		// create popover
		if (! this._oPopover) {
			this._oPopover = sap.ui.xmlfragment("popoverNavCon", "sap.m.sample.PopoverNavCon.Popover", this);
			this.getView().addDependent(this._oPopover);
		}

		// delay because addDependent will do a async rerendering and the popover will immediately close without it
		var oButton = oEvent.getSource();
		jQuery.sap.delayedCall(0, this, function () {
			this._oPopover.openBy(oButton);
		});
	},

	onNavToProduct : function (oEvent) {
		var oCtx = oEvent.getSource().getBindingContext();
		var oNavCon = sap.ui.core.Fragment.byId("popoverNavCon", "navCon");
		var oDetailPage = sap.ui.core.Fragment.byId("popoverNavCon", "detail");
		oNavCon.to(oDetailPage);
		oDetailPage.bindElement(oCtx.getPath());
	},

	onNavBack : function (oEvent) {
		var oNavCon = sap.ui.core.Fragment.byId("popoverNavCon", "navCon");
		oNavCon.back();
	}
});
