sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var ControllerController = Controller.extend("sap.ui.unified.sample.SplitContainer.Controller", {
		handleSwitchOrientation: function(oEvent) {
			var sOrientation = this.byId("mySplitContainer").getOrientation();
			if (sOrientation == "Vertical") {
				sOrientation = "Horizontal";
			} else {
				sOrientation = "Vertical";
			}
			this.byId("mySplitContainer").setOrientation(sOrientation);
		},

		handleToggleSecondaryContent: function(oEvent) {
			var oSplitContainer = this.byId("mySplitContainer");
			oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());
		}
	});

	return ControllerController;

});
