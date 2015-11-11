sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"sap/m/MessageToast",
	"sap/m/SplitContainer"
], function (JSONModel, Controller, Device, MessageToast, SplitContainer) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageFormLayout.ObjectPageFormLayout", {
		onInit: function () {
			//by default we always show the master
			if (Device.system.desktop) {
				this._oSplitContainer = sap.ui.getCore().byId("splitApp");
				if (this._oSplitContainer) {
					this._oSplitContainer.backToPage = this._back.bind(this._oSplitContainer);
				}
			}

			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageOnJSONWithLazyLoading/HRData.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		},

		onBeforeRendering: function () {

			if (Device.system.desktop && this._oSplitContainer) {
				this._oSplitContainer.setMode("HideMode");
				this._oSplitContainer.hideMaster();
			}
		},

		handleLink1Press: function (oEvent) {
			MessageToast.show("Page 1 a very long link clicked");
		},

		handleLink2Press: function (oEvent) {
			MessageToast.show("Page 2 long link clicked");
		},

		_back: function () {
			this.setMode("ShowHideMode");
			this.showMaster();
			SplitContainer.prototype.backToPage.apply(this, arguments);
		}
	});
}, true);
