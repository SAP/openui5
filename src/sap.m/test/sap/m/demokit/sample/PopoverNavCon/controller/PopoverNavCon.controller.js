sap.ui.define([
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Fragment, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.PopoverNavCon.controller.PopoverNavCon", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onOpenPopover: function (oEvent) {
			var oButton = oEvent.getSource();
			// create popover
			if (!this._oPopover) {
				Fragment.load({
					id: "popoverNavCon",
					name: "sap.m.sample.PopoverNavCon.view.Popover",
					controller: this
				}).then(function(oPopover){
					this._oPopover = oPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
		},

		onNavToProduct : function (oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oNavCon = Fragment.byId("popoverNavCon", "navCon");
			var oDetailPage = Fragment.byId("popoverNavCon", "detail");
			oNavCon.to(oDetailPage);
			oDetailPage.bindElement(oCtx.getPath());
			this._oPopover.focus();
		},

		onNavBack : function (oEvent) {
			var oNavCon = Fragment.byId("popoverNavCon", "navCon");
			oNavCon.back();
			this._oPopover.focus();
		}
	});
});