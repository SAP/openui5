sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	'sap/ui/Device'
], function (Controller, MessageToast, Device) {
	"use strict";

	return Controller.extend("sap.tnt.sample.ToolHeader.C", {

		onAvatarPressed: function () {
			MessageToast.show("Avatar pressed!");
		},

		onLogoPressed: function () {
			MessageToast.show("Logo pressed!");
		},

		_handleMediaChange: function () {
			var rangeName = Device.media.getCurrentRange("StdExt").name;

			switch (rangeName) {
				// Shell Desktop
				case "LargeDesktop":
					this.byId("productName").setVisible(true);
					this.byId("secondTitle").setVisible(true);
					this.byId("searchField").setVisible(true);

					this.byId("searchButton").setVisible(false);
					MessageToast.show("Screen width is corresponding to Large Desktop");
					break;

				// Tablet - Landscape
				case "Desktop":
					this.byId("productName").setVisible(true);
					this.byId("secondTitle").setVisible(false);
					this.byId("searchField").setVisible(true);

					this.byId("searchButton").setVisible(false);
					MessageToast.show("Screen width is corresponding to Desktop");
					break;

				// Tablet - Portrait
				case "Tablet":
					this.byId("productName").setVisible(true);
					this.byId("secondTitle").setVisible(true);
					this.byId("searchButton").setVisible(true);
					this.byId("searchField").setVisible(false);

					MessageToast.show("Screen width is corresponding to Tablet");
					break;

				case "Phone":
					this.byId("searchButton").setVisible(true);
					this.byId("searchField").setVisible(false);

					this.byId("productName").setVisible(false);
					this.byId("secondTitle").setVisible(false);
					MessageToast.show("Screen width is corresponding to Phone");
					break;

				default:
					break;
			}
		},

		onInit: function() {
			Device.media.attachHandler(this._handleMediaChange, this);

			this._handleMediaChange();
		},

		onExit: function() {
			Device.media.detachHandler(this._handleMediaChange, this);
		}
	});
});