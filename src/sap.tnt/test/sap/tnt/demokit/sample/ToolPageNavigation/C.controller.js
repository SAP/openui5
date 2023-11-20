sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"

], function (Device, Controller, JSONModel, MessageToast) {
	"use strict";

	return Controller.extend("sap.tnt.sample.ToolPageNavigation.C", {

		onInit: function () {
			var oDeviceModel = new JSONModel(Device);
			this.getView().setModel(oDeviceModel, "device");

			var oModel = new JSONModel(sap.ui.require.toUrl("sap/tnt/sample/ToolPageNavigation/model/data.json"));
			this.getView().setModel(oModel);
			this._setToggleButtonTooltip(!Device.system.desktop);

			Device.media.attachHandler(this._handleMediaChange, this);
			this._handleMediaChange();
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
		},

		_handleMediaChange: function () {
			var rangeName = Device.media.getCurrentRange("StdExt").name;

			switch (rangeName) {
				// Shell Desktop
				case "LargeDesktop":
					this.byId("productName").setVisible(true);
					this.byId("secondTitle").setVisible(true);
					this.byId("searchField").setVisible(true);
					this.byId("spacer").setVisible(true);
					this.byId("searchButton").setVisible(false);
					MessageToast.show("Screen width is corresponding to Large Desktop");
					break;

				// Tablet - Landscape
				case "Desktop":
					this.byId("productName").setVisible(true);
					this.byId("secondTitle").setVisible(false);
					this.byId("searchField").setVisible(true);
					this.byId("spacer").setVisible(true);
					this.byId("searchButton").setVisible(false);
					MessageToast.show("Screen width is corresponding to Desktop");
					break;

				// Tablet - Portrait
				case "Tablet":
					this.byId("productName").setVisible(true);
					this.byId("secondTitle").setVisible(true);
					this.byId("searchButton").setVisible(true);
					this.byId("searchField").setVisible(false);
					this.byId("spacer").setVisible(false);
					MessageToast.show("Screen width is corresponding to Tablet");
					break;

				case "Phone":
					this.byId("searchButton").setVisible(true);
					this.byId("searchField").setVisible(false);
					this.byId("spacer").setVisible(false);
					this.byId("productName").setVisible(false);
					this.byId("secondTitle").setVisible(false);
					MessageToast.show("Screen width is corresponding to Phone");
					break;
				default:
					break;
			}
		},

		onExit: function() {
			Device.media.detachHandler(this._handleMediaChange, this);
		}
	});
});