sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/SplitContainer",
	"sap/ui/Device"
], function (JSONModel, Controller, SplitContainer, Device) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageState.ObjectPageState", {
		onInit: function () {
			//by default we always show the master
			if (Device.system.desktop) {
				this._oSplitContainer = sap.ui.getCore().byId("splitApp");
				this._oSplitContainer.backToPage = jQuery.proxy(function () {

					this.setMode("ShowHideMode");
					this.showMaster();

					SplitContainer.prototype.backToPage.apply(this, arguments);

				}, this._oSplitContainer);
			}

			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageState/HRData.json");

			this.getView().setModel(oJsonModel, "ObjectPageModel");

			//navigate to a specific subsection on open
			this.oObjectPageLayout = this.getView().byId("ObjectPageLayout");
			this.oTargetSubSection = this.getView().byId("paymentSubSection");
			this.oTargetSubSection.setMode("Expanded");

			this.oObjectPageLayout.addEventDelegate({
				onAfterRendering: jQuery.proxy(function () {
					//need to wait for the scrollEnablement to be active
					jQuery.sap.delayedCall(500, this.oObjectPageLayout, this.oObjectPageLayout.scrollToSection, [this.oTargetSubSection.getId()]);
				}, this)
			});
		},

		onBeforeRendering: function () {

			if (Device.system.desktop) {
				this._oSplitContainer.setMode("HideMode");
				this._oSplitContainer.hideMaster();
			}
		}
	});
}, true);
