sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
	"use strict";
	return Controller.extend("sap.uxap.testblocks.multiview.MultiViewBlockCommon", {
		handlePress: function () {
			var sNewMode = this.oParentBlock.getMode() == sap.uxap.ObjectPageSubSectionMode.Collapsed ? sap.uxap.ObjectPageSubSectionMode.Expanded : sap.uxap.ObjectPageSubSectionMode.Collapsed;
			this.oParentBlock.setMode(sNewMode);
		}
	});
}, true);




