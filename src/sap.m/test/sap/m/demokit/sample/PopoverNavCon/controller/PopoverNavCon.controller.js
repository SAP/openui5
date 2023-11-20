sap.ui.define([
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(Fragment, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.PopoverNavCon.controller.PopoverNavCon", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onOpenPopover: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();

			// create popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.PopoverNavCon.view.Popover",
					controller: this
				}).then(function(oPopover){
					oView.addDependent(oPopover);
					return oPopover;
				});
			}

			this._pPopover.then(function(oPopover){
				oPopover.openBy(oButton);
			});
		},

		onNavToProduct : function (oEvent) {
			var oCtx = oEvent.getSource().getBindingContext();
			var oNavCon = this.byId("navCon");
			var oDetailPage = this.byId("detail");
			oNavCon.to(oDetailPage);
			oDetailPage.bindElement(oCtx.getPath());
			this.byId("myPopover").focus();
		},

		onNavBack : function (oEvent) {
			var oNavCon = this.byId("navCon");
			oNavCon.back();
			this.byId("myPopover").focus();
		}
	});
});