sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutSimple.controller.DetailDetail", {
		onInit: function () {
			this.bus = this.getOwnerComponent().getEventBus();
		},
		handleClose: function () {
			MessageToast.show("Closing end column...");
			this.bus.publish("flexible", "setDetailPage");
		}
	});
});
