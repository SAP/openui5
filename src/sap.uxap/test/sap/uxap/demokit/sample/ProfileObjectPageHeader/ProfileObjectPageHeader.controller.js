sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/SplitContainer",
	"sap/ui/Device"
], function (JSONModel, Controller, SplitContainer, Device) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ProfileObjectPageHeader.ProfileObjectPageHeader", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ProfileObjectPageHeader/employee.json");
			this.getView().setModel(oJsonModel, "ObjectPageModel");
			if (Device.system.desktop) {
				this._oSplitContainer = sap.ui.getCore().byId("splitApp");
				this._oSplitContainer.backToPage = jQuery.proxy(function () {

					this.setMode("ShowHideMode");
					this.showMaster();

					SplitContainer.prototype.backToPage.apply(this, arguments);

				}, this._oSplitContainer);
			}
		},
		onBeforeRendering: function () {
			//hide master for this page
			if (Device.system.desktop) {
				this._oSplitContainer.setMode("HideMode");
				this._oSplitContainer.hideMaster();
			}
		}
	});
}, true);
