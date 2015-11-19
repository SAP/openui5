sap.ui.define(["sap/m/MessageToast"], function (MessageToast) {
	"use strict";

	var ObjectPageEvents = {};
	ObjectPageEvents.onImageBlockPress = function (oEvent) {
		MessageToast.show("image block press");
	};

	ObjectPageEvents.onSubSectionEditPress = function (oEvent) {
		MessageToast.show("subsection press");
	};

	return ObjectPageEvents;

}, /* bExport= */ true);
