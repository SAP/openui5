sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageToast, Fragment, Controller, JSONModel) {
	"use strict";

	var PopoverController = Controller.extend("sap.m.sample.PopoverControllingCloseBehavior.controller.PopoverControllingCloseBehavior", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			oModel.setSizeLimit(10);
			this.getView().setModel(oModel);
		},

		handlePopoverPress: function (oEvent) {
			var oCtx = oEvent.getSource().getBindingContext(),
				oControl = oEvent.getSource(),
				oView = this.getView();

			// create popover
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.PopoverControllingCloseBehavior.view.Popover",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					oPopover.attachAfterOpen(function() {
						this.disablePointerEvents();
					}, this);
					oPopover.attachAfterClose(function() {
						this.enablePointerEvents();
					}, this);
					return oPopover;
				}.bind(this));
			}
			this._pPopover.then(function(oPopover) {
				oPopover.bindElement(oCtx.getPath());
				oPopover.openBy(oControl);
			});
		},

		disablePointerEvents: function () {
			this.byId("idProductsTable").getDomRef().style["pointer-events"] = "none";
		},

		enablePointerEvents: function () {
			this.byId("idProductsTable").getDomRef().style["pointer-events"] = "auto";
		},

		handleActionPress: function () {
			// note: We don't need to chain to the _pPopover promise, since this event-handler
			// is only called from within the loaded dialog itself.
			this.byId("myPopover").close();
			MessageToast.show("Action has been pressed");
		},

		handleDrillDown: function () {
			MessageToast.show("Drill down activated.");
		}
	});

	return PopoverController;

});