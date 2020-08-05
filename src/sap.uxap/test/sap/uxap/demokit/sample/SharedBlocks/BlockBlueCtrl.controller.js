sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var CController = Controller.extend("sap.uxap.sample.SharedBlocks.BlockBlueCtrl", {
		onParentBlockModeChange: function (sMode) {
			// this.oParentBlock is available here
		}
	});

	return CController;
});
