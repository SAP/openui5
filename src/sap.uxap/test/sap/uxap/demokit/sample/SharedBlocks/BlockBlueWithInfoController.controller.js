sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.SharedBlocks.BlockBlueWithInfoController", {

		onInit: function () {
		},

		onAfterRendering: function () {
			var oText = this.byId("moreContentText");
			var sMode = this.getView().getParent().getMode();
			if (sMode === "Expanded") {
				oText.setText("...More Content");
			} else {
				oText.setText("");
			}
		},


		onParentBlockModeChange: function () {

		}
	});
}, true);
