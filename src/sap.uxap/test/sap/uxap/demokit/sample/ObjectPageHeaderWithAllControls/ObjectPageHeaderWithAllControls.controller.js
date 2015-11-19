sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (JSONModel, Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageHeaderWithAllControls.ObjectPageHeaderWithAllControls", {
		onAfterRendering: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageHeaderWithAllControls/employee.json");

			this.getView().setModel(oJsonModel, "ObjectPageModel");

			var oSampleModel = new JSONModel({
				text: "working binding",
				icon: "sap-icon://chain-link"
			});

			this.getView().setModel(oSampleModel, "buttons");

			// set explored app's demo model on this sample
			var oModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageHeaderWithAllControls/products.json");
			oModel.setDefaultBindingMode("OneWay");
			this.getView().setModel(oModel);
		},
		onFormat: function () {
			return "formatted link";
		},
		_getResponsivePopover: function () {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.uxap.sample.ObjectPageHeaderWithAllControls.Popover", this);
				this.getView().addDependent(this._oPopover);
			}
			return this._oPopover;
		},
		handleTitleSelectorPress: function (oEvent) {
			var oPopOver = this._getResponsivePopover();
			oPopOver.openBy(oEvent.getParameter("domRef"));
			oPopOver.setModel(oEvent.getSource().getModel());
		},
		handleItemSelect: function (oEvent) {
			this._oPopover.close();
		},
		_getResponsivePopoverLock: function () {
			if (!this._oPopoverLock) {
				this._oPopoverLock = sap.ui.xmlfragment("sap.uxap.sample.ObjectPageHeaderWithAllControls.PopoverLock", this);
				this.getView().addDependent(this._oPopover);
			}
			return this._oPopoverLock;
		},
		handleMarkLockedPress: function (oEvent) {
			var oPopoverLock = this._getResponsivePopoverLock();
			oPopoverLock.openBy(oEvent.getParameter("domRef"));
			oPopoverLock.setModel(oEvent.getSource().getModel());
		},
		handleLink1Press: function (oEvent) {
			var msg = 'Page 1 a very long link clicked',
				msgToast = MessageToast;
			msgToast.show(msg);
		},
		handleLink2Press: function (oEvent) {
			var msg = 'Page 2 long link clicked',
				msgToast = MessageToast;
			msgToast.show(msg);
		}
	});
});
