sap.ui.define([
	"sap/m/SplitContainer",
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (SplitContainer, Device, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageSubSectionSized.ObjectPageSubSectionSize", {
		onInit: function () {
			this.oJsonConfigModel = new JSONModel(
				{
					subSectionLayout: "TitleOnTop",
					useTwoColumnsForLargeScreen: false
				});
			this.getView().setModel(this.oJsonConfigModel, "ConfigModel");
			this.isTitleOnTop = true;
			this.bUseTwoColumns = false;

			// by default we always show the master
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
		},
		toggleTitle: function () {

			this.isTitleOnTop = !(this.isTitleOnTop);
			this.oJsonConfigModel.setProperty("/subSectionLayout", this.isTitleOnTop ? "TitleOnTop" : "TitleOnLeft");
		},
		toggleUseTwoColumns: function () {
			this.bUseTwoColumns = !(this.bUseTwoColumns);
			this.oJsonConfigModel.setProperty("/useTwoColumnsForLargeScreen", this.bUseTwoColumns);
		}
	});
}, true)
