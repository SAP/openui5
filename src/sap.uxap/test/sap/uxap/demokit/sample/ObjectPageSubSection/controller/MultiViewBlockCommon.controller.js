sap.ui.define(["sap/ui/core/mvc/Controller", "sap/uxap/library"], function (Controller, uxapLibrary) {
	"use strict";

	var ObjectPageSubSectionMode = uxapLibrary.ObjectPageSubSectionMode;

	return Controller.extend("sap.uxap.sample.ObjectPageSubSection.controller.MultiViewBlockCommon", {
		handlePress: function () {
			var sNewMode = this.oParentBlock.getMode() === ObjectPageSubSectionMode.Collapsed ? ObjectPageSubSectionMode.Expanded : ObjectPageSubSectionMode.Collapsed;
			this.oParentBlock.setMode(sNewMode);
		}
	});
});
