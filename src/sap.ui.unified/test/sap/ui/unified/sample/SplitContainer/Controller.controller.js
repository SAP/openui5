sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
	"use strict";

	var ControllerController = Controller.extend("sap.ui.unified.sample.SplitContainer.Controller", {
		handleSwitchOrientation: function(oEvent) {
			var sOrientation = this.getView().byId("mySplitContainer").getOrientation();
			if(sOrientation == "Vertical") {
				sOrientation = "Horizontal";
			}
			else {
				sOrientation = "Vertical";
			}
			this.getView().byId("mySplitContainer").setOrientation(sOrientation);
		},

		handleToggleSecondaryContent: function(oEvent) {
			var oSplitContainer = this.getView().byId("mySplitContainer");
			oSplitContainer.setShowSecondaryContent(!oSplitContainer.getShowSecondaryContent());
		}
	});

	return ControllerController;

});
