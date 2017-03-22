sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/m/SplitContainer"
], function (JSONModel, Controller, SplitContainer) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageBlockBase.ObjectPageBlockBase", {
		onInit: function () {
			this.oJsonConfigModel = new JSONModel(
				{
					subSectionLayout: "TitleOnTop"
				});
			this.getView().setModel(this.oJsonConfigModel, "ConfigModel");
			this.isTitleOnTop = true;

			// by default we always show the master
			if (sap.ui.Device.system.desktop) {
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
			if (sap.ui.Device.system.desktop) {
				this._oSplitContainer.setMode("HideMode");
				this._oSplitContainer.hideMaster();
			}
		},
		toggleTitle: function () {

			this.isTitleOnTop = !(this.isTitleOnTop);
			this.oJsonConfigModel.setProperty("/subSectionLayout", this.isTitleOnTop ? "TitleOnTop" : "TitleOnLeft");
		}
	});
}, true);
