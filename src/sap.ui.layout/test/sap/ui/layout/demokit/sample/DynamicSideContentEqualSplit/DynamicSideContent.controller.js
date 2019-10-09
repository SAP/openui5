sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel', 'sap/ui/Device'],
	function(Controller, JSONModel, Device) {
	"use strict";

	return Controller.extend("sap.ui.layout.sample.DynamicSideContentEqualSplit.DynamicSideContent", {
		onInit : function () {
			// set explored app's demo model on this sample
			var oImgModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/img.json");
			this.getView().setModel(oImgModel, "img");
		},
		onBeforeRendering: function() {
			this.byId("DSCWidthSlider").setVisible(!Device.system.phone);
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
		updateToggleButtonState: function (oEvent) {
			var oToggleButton = this.byId("equalSplitToggleButton"),
				sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");

			if (sCurrentBreakpoint === "S") {
				oToggleButton.setEnabled(true);
			} else {
				oToggleButton.setEnabled(false);
			}
		},
		handleToggleClick: function (oEvent) {
			this.byId("DynamicSideContent").toggle();
		}
	});

});