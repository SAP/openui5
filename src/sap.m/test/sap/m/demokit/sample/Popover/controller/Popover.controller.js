sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(MessageToast, Fragment, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.Popover.controller.Popover", {

		onInit : function (evt) {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onExit : function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},

		handlePopoverPress: function (oEvent) {
			var oButton = oEvent.getSource();

			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "sap.m.sample.Popover.view.Popover",
					controller: this
				}).then(function(pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.bindElement("/ProductCollection/0");
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
		},

		handleEmailPress: function (oEvent) {
			this._oPopover.close();
			MessageToast.show("E-Mail has been sent");
		}
	});
});