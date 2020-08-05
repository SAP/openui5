sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/m/Button"
], function (Device, Controller, JSONModel, Button) {
	"use strict";

	return Controller.extend("sap.f.sample.ShellBarProductSwitch.controller.ShellBarProductSwitch", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/f/sample/ShellBarProductSwitch/model/data.json"));
			this.getView().setModel(oModel);

			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.f.sample.ShellBarProductSwitch.view.ProductSwitchPopover", this);
				this.getView().addDependent(this._oPopover);

				if (Device.system.phone) {
					this._oPopover.setEndButton(new Button({text: "Close", type: "Emphasized", press: this.fnClose.bind(this)}));
				}
			}
		},
		fnChange: function (oEvent) {
			sap.m.MessageToast.show("Change event was fired from " + oEvent.getParameter("itemPressed").getId()
				+ ". It has targetSrc: "
				+ oEvent.getParameter("itemPressed").getTargetSrc()
				+ " and target: "
				+ oEvent.getParameter("itemPressed").getTarget()
				+ ".");
		},
		fnOpen: function (oEvent) {
			this._oPopover.openBy(oEvent.getParameter("button"));
		},
		fnClose: function () {
			this._oPopover.close();
		}
	});
});