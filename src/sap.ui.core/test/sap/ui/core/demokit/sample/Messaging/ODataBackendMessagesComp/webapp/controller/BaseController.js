sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (UIComponent, Controller, History) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.Messaging.ODataBackendMessagesComp.controller.BaseController", {

		getRouter() {
			return UIComponent.getRouterFor(this);
		},

		onNavBack() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome", {}, true /*no history*/);
			}
		},

		async onMessagePopoverPress(oEvent) {
			const oSourceControl = oEvent.getSource();
			const oMessagePopover = await this._getMessagePopover();
			oMessagePopover.openBy(oSourceControl);
		},

		//################ Private APIs ###################

		_getMessagePopover() {
			return this.loadFragment({
				name: "sap.ui.core.sample.Messaging.ODataBackendMessagesComp.fragment.MessagePopover"
			});
		}

	});

});
