sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device"
], function (JSONModel, Controller, Device) {
	"use strict";
	return Controller.extend("sap.uxap.sample.ObjectPageWithIconTabBar.ObjectPageWithIconTabBar", {
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

			var oJsonModel = new sap.ui.model.json.JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageWithIconTabBar/HRData.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
		},
		onBeforeRendering: function () {
			if (Device.system.desktop && this._oSplitContainer) {
				this._oSplitContainer.setMode("HideMode");
				this._oSplitContainer.hideMaster();
			}
		}
	});
}, true);
