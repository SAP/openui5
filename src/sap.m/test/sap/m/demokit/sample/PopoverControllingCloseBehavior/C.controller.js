sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageToast, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.PopoverControllingCloseBehavior.C", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			oModel.setSizeLimit(10);
			this.getView().setModel(oModel);
		},

		onExit : function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		handlePopoverPress: function (oEvent) {

			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.m.sample.PopoverControllingCloseBehavior.Popover", this);
				this.getView().addDependent(this._oPopover);
				this._oPopover.attachAfterOpen(function() {
					this.disablePointerEvents();
				}, this);
				this._oPopover.attachAfterClose(function() {
					this.enablePointerEvents();
				}, this);
			}

			var oCtx = oEvent.getSource().getBindingContext();
			this._oPopover.bindElement(oCtx.getPath());

			// delay because addDependent will do a async rerendering and the actionSheet will immediately close without it.
			var oControl = oEvent.getSource();
			this._oPopover.openBy(oControl);

		},

		disablePointerEvents: function () {
			this.byId("idProductsTable").setBlocked(true);
		},

		enablePointerEvents: function () {
			this.byId("idProductsTable").setBlocked(false);
		},

		handleActionPress: function (oEvent) {
			this._oPopover.close();
			MessageToast.show("Action has been pressed");
		}
	});


	return CController;

});