sap.ui.define([
	"sap/m/SplitContainer",
	"sap/ui/Device",
	"sap/ui/core/mvc/Controller",
], function (SplitContainer, Device, Controller) {
	"use strict";
	return Controller.extend("sap.uxap.sample.ObjectPageSubSectionMultiView.ObjectPageSubSectionMultiView", {
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
		},
		onBeforeRendering: function () {
			//hide master for this page
			if (Device.system.desktop) {
				this._oSplitContainer.setMode("HideMode");
				this._oSplitContainer.hideMaster();
			}
		},
		onAfterRendering: function () {
			//demokit specific
			$(".sapUiSimpleForm").css("backgroundColor", "green")
		}
	});
}, true);

