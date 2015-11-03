sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/ui/Device'],
	function(jQuery, Controller, JSONModel, Device) {
	"use strict";

	var DynamicSideContent = Controller.extend("sap.ui.layout.sample.DynamicSideContentProduct.DynamicSideContent", {
		onInit : function () {
			this._oDSC = this.getView().byId("DynamicSideContent");
			this._showSideContentButton = this.getView().byId("showSideContentButton");

			// set explored app's demo model on this sample
			var oImgModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/img.json"));
			this.getView().setModel(oImgModel, "img");

			// set media model
			var oMediaModel = new JSONModel(Device.system);
			this.getView().setModel(oMediaModel, "media");

			// set mock feed model
			var sPath = jQuery.sap.getModulePath("sap.ui.layout.sample.DynamicSideContentProduct", "/feed.json")
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
		},
		onAfterRendering: function () {
			var sCurrentBreakpoint = this._oDSC.getCurrentBreakpoint();
			this.updateToggleButtonState(sCurrentBreakpoint);
		},
		handleSliderChange: function (oEvent) {
			var iValue = oEvent.getParameter("value");
			this.updateControlWidth(iValue);
		},
		updateControlWidth: function (iValue) {
			var $DSCContainer = this.getView().byId("sideContentContainer").$();
			if (iValue) {
				$DSCContainer.width(iValue + "%");
			}
		},
		handleBreakpointChangeEvent: function (oEvent) {
			var sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");
			this.updateToggleButtonState(sCurrentBreakpoint);
			this.updateShowSideContentButtonVisibility(sCurrentBreakpoint);
		},
		updateToggleButtonState: function (sCurrentBreakpoint) {
			var oToggleButton = this.getView().byId("toggleButton");
			oToggleButton.setEnabled(sCurrentBreakpoint === "S");
		},
		updateShowSideContentButtonVisibility: function (sCurrentBreakpoint) {
			var bShowButton = !(sCurrentBreakpoint === "S" || this._oDSC.getShowSideContent());
			this._showSideContentButton.setVisible(bShowButton);
		},
		handleToggleClick: function (oEvent) {
			this.getView().byId("DynamicSideContent").toggle();
		},
		handleSideContentHide: function (oEvent) {
			this._oDSC.setShowSideContent(false);
			this.updateShowSideContentButtonVisibility(this._oDSC.getCurrentBreakpoint());
		},
		handleSideContentShow: function (oEvent) {
			this._oDSC.setShowSideContent(true);
			this.updateShowSideContentButtonVisibility(this._oDSC.getCurrentBreakpoint());
		}
	});

	return DynamicSideContent;

});
