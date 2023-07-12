sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment"
], function (JSONModel, Controller, MessageToast, Fragment) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageHeaderWithAllControls.controller.ObjectPageHeaderWithAllControls", {
		onAfterRendering: function () {
			var oJsonModel = new JSONModel(sap.ui.require.toUrl("sap/uxap/sample/SharedJSONData/employee.json"));

			this.getView().setModel(oJsonModel, "ObjectPageModel");

			var oSampleModel = new JSONModel({
				text: "working binding",
				icon: "sap-icon://chain-link"
			});

			this.getView().setModel(oSampleModel, "buttons");

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/uxap/sample/SharedJSONData/products.json"));
			oModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oModel);
		},
		onFormat: function () {
			return "formatted link";
		},
		_getResponsivePopover: function () {
			if (!this._oPopoverPromise) {
				this._oPopoverPromise = Fragment.load({
					id: this.getView().getId(),
					name: "sap.uxap.sample.ObjectPageHeaderWithAllControls.view.Popover",
					controller: this
				}).then(function (oPopover) {
					this.getView().addDependent(oPopover);
					return oPopover;
				}.bind(this));
			}
			return this._oPopoverPromise;
		},
		handleTitleSelectorPress: function (oEvent) {
			this._getResponsivePopover().then(function (oPopOver) {
				oPopOver.openBy(oEvent.getParameter("domRef"));
				oPopOver.setModel(oEvent.getSource().getModel());
			});
		},
		handleItemSelect: function (oEvent) {
			this._oPopover.close();
		},
		_getResponsivePopoverLock: function () {
			if (!this._oPopoverLock) {
				this._oPopoverLock = Fragment.load({
					id: this.getView().getId(),
					name: "sap.uxap.sample.ObjectPageHeaderWithAllControls.view.PopoverLock",
					controller: this
				}).then(function (oPopover) {
					this.getView().addDependent(oPopover);
					return oPopover;
				}.bind(this));
			}
			return this._oPopoverLock;
		},
		handleMarkLockedPress: function (oEvent) {
			this._getResponsivePopoverLock().then(function (oPopoverLock) {
				oPopoverLock.openBy(oEvent.getParameter("domRef"));
				oPopoverLock.setModel(oEvent.getSource().getModel());
			});
		},
		handleLink1Press: function (oEvent) {
			var msg = 'Page 1 a very long link clicked';
			MessageToast.show(msg);
		},
		handleLink2Press: function (oEvent) {
			var msg = 'Page 2 long link clicked';
			MessageToast.show(msg);
		}
	});
});
