sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Fragment, Controller, JSONModel) {
	"use strict";

	var PopoverController = Controller.extend("sap.m.sample.PopoverControllingCloseBehavior.controller.PopoverControllingCloseBehavior", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			oModel.setSizeLimit(10);
			this.getView().setModel(oModel);
		},

		onExit: function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		handlePopoverPress: function (oEvent) {
			var oCtx = oEvent.getSource().getBindingContext(),
				oControl = oEvent.getSource();

			// create popover
			if (!this._oPopover) {
				Fragment.load({
					id: "PopoverControllingCloseBehavior",
					name: "sap.m.sample.PopoverControllingCloseBehavior.view.Popover",
					controller: this
				}).then(function (oPopover) {
					this._oPopover = oPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.attachAfterOpen(function() {
						this.disablePointerEvents();
					}, this);
					this._oPopover.attachAfterClose(function() {
						this.enablePointerEvents();
					}, this);

					this._oPopover.bindElement(oCtx.getPath());
					this._oPopover.openBy(oControl);
				}.bind(this));
			} else {
				this._oPopover.bindElement(oCtx.getPath());
				this._oPopover.openBy(oControl);
			}
		},

		disablePointerEvents: function () {
			this.byId("idProductsTable").getDomRef().style["pointer-events"] = "none";
		},

		enablePointerEvents: function () {
			this.byId("idProductsTable").getDomRef().style["pointer-events"] = "auto";
		},

		handleActionPress: function () {
			this._oPopover.close();
			MessageToast.show("Action has been pressed");
		},

		handleDrillDown: function () {
			MessageToast.show("Drill down activated.");
		}
	});

	return PopoverController;

});