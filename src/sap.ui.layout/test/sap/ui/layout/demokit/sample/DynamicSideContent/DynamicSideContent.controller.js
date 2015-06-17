sap.ui.define(['jquery.sap.global', 'sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var DynamicSideContent = Controller.extend("sap.ui.layout.sample.DynamicSideContent.DynamicSideContent", {
		handleSliderChange: function (oEvent) {
			var iValue = oEvent.getParameter("value");
			this.updateControlWidth(iValue);
		},
		onAfterRendering: function (oEvent) {
			// Get the initial breakpoint here.
			this.updateToggleButtonState();
		},
		updateControlWidth: function (iValue) {
			var $DSCContainer = this.getView().byId("sideContentContainer").$();
			if (iValue) {
				$DSCContainer.width(iValue + "%");
				this.updateToggleButtonState();
			}
		},
		updateToggleButtonState: function () {
			var oToggleButton = this.getView().byId("toggleButton"),
				oDSC = this.getView().byId("DynamicSideContent");

			if (oDSC.getCurrentBreakpoint() === "S") {
				oToggleButton.setEnabled(true);
			} else {
				oToggleButton.setEnabled(false);
			}
		},
		handleToggleClick: function (oEvent) {
			this.getView().byId("DynamicSideContent").toggle();
		}
	});

	return DynamicSideContent;

});
