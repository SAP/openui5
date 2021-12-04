sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutSimple.controller.Detail", {
		onInit: function () {
			this.bus = this.getOwnerComponent().getEventBus();
		},
		handleDetailPress: function () {
			MessageToast.show("Loading end column...");
			this.bus.publish("flexible", "setDetailDetailPage");
		}
	});
});
