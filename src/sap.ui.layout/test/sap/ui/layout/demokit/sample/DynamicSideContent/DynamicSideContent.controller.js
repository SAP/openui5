sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var DynamicSideContent = Controller.extend("sap.ui.layout.sample.DynamicSideContent.DynamicSideContent", {
		onBeforeRendering: function() {
			this.getView().byId("DSCWidthSlider").setVisible(!sap.ui.Device.system.phone);
			this.getView().byId("DSCWidthHintText").setVisible(!sap.ui.Device.system.phone);
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
		updateToggleButtonState: function (oEvent) {
			var oToggleButton = this.getView().byId("toggleButton"),
				sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint");

			if (sCurrentBreakpoint === "S") {
				oToggleButton.setEnabled(true);
			} else {
				oToggleButton.setEnabled(false);
			}
		},
		handleToggleClick: function () {
			this.getView().byId("DynamicSideContent").toggle();
		}
	});

	return DynamicSideContent;
});
