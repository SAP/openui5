sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/m/MessageToast"

], function (Controller, JSONModel, Device, MessageToast) {
	"use strict";

	return Controller.extend("sap.tnt.sample.ToolPageHorizontalNavigation.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/tnt/sample/ToolPageHorizontalNavigation/model/data.json"));
			this.getView().setModel(oModel);

			Device.media.attachHandler(this._handleMediaChange, this);
			this._handleMediaChange();
		},

		onItemSelect: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
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