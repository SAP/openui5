sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/ui/Device'],
	function(Controller, JSONModel, Device) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.DynamicSideContentEqualSplit.DynamicSideContent", {
		onInit : function () {
			// set explored app's demo model on this sample
			var oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/img.json"));
			this.getView().setModel(oImgModel, "img");
			this._oDSC = this.byId("DynamicSideContent");
			this._oToggleButton = this.byId("equalSplitToggleButton");
		},
		onBeforeRendering: function() {
			this.byId("DSCWidthSlider").setVisible(!Device.system.phone);
		},
		onAfterRendering: function() {
			var sCurrentBreakpoint = this._oDSC.getCurrentBreakpoint();
			this._updateToggleButtonState(sCurrentBreakpoint);
		},
		handleSliderChange: function (oEvent) {
			var iValue = oEvent.getParameter("value");
			this.updateControlWidth(iValue);
		},
		updateControlWidth: function (iValue) {
			var $DSCContainer = this.byId("sideContentContainer").$();
			if (iValue) {
				$DSCContainer.width(iValue + "%");
			}
		},
		handleBreakpointChanged: function (oEvent) {
			var sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");
			this._updateToggleButtonState(sCurrentBreakpoint);
		},
		handleToggleClick: function (oEvent) {
			this._oDSC.toggle();
		},
		_updateToggleButtonState: function(sCurrentBreakpoint) {
			if (sCurrentBreakpoint === "S") {
				this._oToggleButton.setEnabled(true);
			} else {
				this._oToggleButton.setEnabled(false);
			}
		}
	});

});