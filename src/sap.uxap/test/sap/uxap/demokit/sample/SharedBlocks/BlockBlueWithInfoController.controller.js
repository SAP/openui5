sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.SharedBlocks.BlockBlueWithInfoController", {

		onInit: function () {
		},

		onAfterRendering: function () {
			var oText = this.getView().byId("moreContentText");
			var sMode = this.getView().getParent().getMode();
			(sMode === "Expanded") ? oText.setText("...More Content") : oText.setText("");
		},


		onParentBlockModeChange: function () {

		}
	});
}, true);
