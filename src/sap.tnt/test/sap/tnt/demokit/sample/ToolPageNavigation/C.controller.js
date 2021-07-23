sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Device, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.tnt.sample.ToolPageNavigation.C", {

		onInit: function () {
			var oDeviceModel = new JSONModel(Device);
			this.getView().setModel(oDeviceModel, "device");

			var oModel = new JSONModel(sap.ui.require.toUrl("sap/tnt/sample/ToolPageNavigation/model/data.json"));
			this.getView().setModel(oModel);
			this._setToggleButtonTooltip(!Device.system.desktop);
		},

		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
		},

		onSideNavButtonPress: function () {
			var oToolPage = this.byId("toolPage");
			var bSideExpanded = oToolPage.getSideExpanded();

			this._setToggleButtonTooltip(bSideExpanded);

			oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
		},

		_setToggleButtonTooltip: function (bLarge) {
			var oToggleButton = this.byId('sideNavigationToggleButton');
			if (bLarge) {
				oToggleButton.setTooltip('Large Size Navigation');
			} else {
				oToggleButton.setTooltip('Small Size Navigation');
			}
		}
	});
});