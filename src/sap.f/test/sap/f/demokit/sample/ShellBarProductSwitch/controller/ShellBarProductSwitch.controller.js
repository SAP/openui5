sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment"
], function (Device, Controller, JSONModel, Button, MessageToast, Fragment) {
	"use strict";

	return Controller.extend("sap.f.sample.ShellBarProductSwitch.controller.ShellBarProductSwitch", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/ShellBarProductSwitch/model/data.json")),
				oView = this.getView();
			this.getView().setModel(oModel);

			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					id: oView.getId(),
					name: "sap.f.sample.ShellBarProductSwitch.view.ProductSwitchPopover",
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
			MessageToast.show("Change event was fired from " + oEvent.getParameter("itemPressed").getId()
				+ ". It has targetSrc: "
				+ oEvent.getParameter("itemPressed").getTargetSrc()
				+ " and target: "
				+ oEvent.getParameter("itemPressed").getTarget()
				+ ".");
		},
		fnOpen: function (oEvent) {
			var oButton = oEvent.getParameter("button");
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