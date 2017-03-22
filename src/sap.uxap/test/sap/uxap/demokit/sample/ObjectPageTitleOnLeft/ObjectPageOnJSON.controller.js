sap.ui.define([
	"sap/m/SplitContainer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/Device"
], function (SplitContainer, JSONModel, Controller, MessageToast, Device) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageTitleOnLeft.ObjectPageOnJSON", {
		onInit: function () {

			//by default we always show the master
			if (Device.system.desktop) {
				this._oSplitContainer = sap.ui.getCore().byId("splitApp");
				if (this._oSplitContainer) {
					this._oSplitContainer.backToPage = jQuery.proxy(function () {

						this.setMode("ShowHideMode");
						this.showMaster();

						SplitContainer.prototype.backToPage.apply(this, arguments);

					}, this._oSplitContainer);
				}

			}

			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageTitleOnLeft/HRData.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		},

		onBeforeRendering: function () {
			if (Device.system.desktop && this._oSplitContainer) {
				this._oSplitContainer.setMode("HideMode");
				this._oSplitContainer.hideMaster();
			}
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
		},
		handleEditBtnPress: function (oEvent) {
			var msg = 'An edit box should appear when you click on the "Edit header" button',
				msgToast = MessageToast;
			msgToast.show(msg);
		}
	});
}, true);
