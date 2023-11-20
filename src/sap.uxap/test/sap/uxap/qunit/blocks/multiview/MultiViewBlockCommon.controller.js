sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/uxap/library"
], function (Controller, library) {
	"use strict";

	// shortcut for sap.uxap.ObjectPageSubSectionMode
	var ObjectPageSubSectionMode = library.ObjectPageSubSectionMode;

	return Controller.extend("sap.uxap.testblocks.multiview.MultiViewBlockCommon", {
		handlePress: function () {
			var sNewMode = this.oParentBlock.getMode() == ObjectPageSubSectionMode.Collapsed ? ObjectPageSubSectionMode.Expanded : ObjectPageSubSectionMode.Collapsed;
			this.oParentBlock.setMode(sNewMode);
		}
	});
});
