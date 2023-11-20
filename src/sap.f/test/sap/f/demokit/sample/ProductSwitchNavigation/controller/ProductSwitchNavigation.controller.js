sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/m/library"
], function (Device, Controller, JSONModel, Button, MessageToast, Fragment, library) {
	"use strict";

	// Shortcut for sap.m.URLHelper
	var URLHelper = library.URLHelper;

	return Controller.extend("sap.f.sample.ProductSwitchNavigation.controller.ProductSwitchNavigation", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/ProductSwitchNavigation/model/data.json")),
				oView = this.getView();

			oView.setModel(oModel);

			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.f.sample.ProductSwitchNavigation.view.ProductSwitchPopover",
					controller: this
				}).then(function(oPopover){
					oView.addDependent(oPopover);
					if (Device.system.phone) {
						oPopover.setEndButton(new Button({text: "Close", type: "Emphasized", press: this.fnClose.bind(this)}));
					}
					return oPopover;
				}.bind(this));
			}
		},
		fnChange: function (oEvent) {
			var oItemPressed = oEvent.getParameter("itemPressed"),
				sTargetSrc = oItemPressed.getTargetSrc();

			MessageToast.show("Redirecting to " + sTargetSrc);

			// Open the targetSrc manually
			URLHelper.redirect(sTargetSrc, true);
		},
		fnOpen: function (oEvent) {
			var oButton = this.getView().byId("pSwitchBtn");
			this._pPopover.then(function(oPopover){
				oPopover.openBy(oButton);
			});
		},
		fnClose: function () {
			this._pPopover.then(function(oPopover){
				oPopover.close();
			});
		}
	});
});