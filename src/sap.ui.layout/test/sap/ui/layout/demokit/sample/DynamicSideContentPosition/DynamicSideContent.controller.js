sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var DynamicSideContent = Controller.extend("sap.ui.layout.sample.DynamicSideContentPosition.DynamicSideContent", {
		onBeforeRendering: function() {
			this.byId("DSCWidthSlider").setVisible(!sap.ui.Device.system.phone);
			this.byId("DSCWidthHintText").setVisible(!sap.ui.Device.system.phone);
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
			var oToggleButton = this.byId("toggleButton"),
				sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");

			if (sCurrentBreakpoint === "S") {
				oToggleButton.setEnabled(true);
			} else {
				oToggleButton.setEnabled(false);
			}
		},
		handleToggleClick: function () {
			this.byId("DynamicSideContent").toggle();
		}
	});

	return DynamicSideContent;
});
