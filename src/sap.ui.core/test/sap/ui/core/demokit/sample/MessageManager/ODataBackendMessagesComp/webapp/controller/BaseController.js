sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (UIComponent, Controller, History) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.MessageManager.ODataBackendMessagesComp.controller.BaseController", {

		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome", {}, true /*no history*/);
			}
		},

		onMessagePopoverPress : function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

		//################ Private APIs ###################

		_getMessagePopover : function () {
			// create popover lazily
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.core.sample.MessageManager.ODataBackendMessagesComp.fragment.MessagePopover", this);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
		}

	});

});
