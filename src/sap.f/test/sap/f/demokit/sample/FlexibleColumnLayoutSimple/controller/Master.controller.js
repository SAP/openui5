sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutSimple.controller.Master", {
		onInit: function () {
			this.bus = this.getOwnerComponent().getEventBus();
		},
		handleMasterPress: function () {
			MessageToast.show("Loading mid column...");
			this.bus.publish("flexible", "setDetailPage");
		}
	});
});
