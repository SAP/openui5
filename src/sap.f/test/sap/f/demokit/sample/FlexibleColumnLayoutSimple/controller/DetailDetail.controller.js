sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/m/MessageToast"
], function (Controller, Core, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutSimple.controller.DetailDetail", {
		onInit: function () {
			this.bus = Core.getEventBus();
		},
		handleClose: function () {
			MessageToast.show("Closing end column...");
			this.bus.publish("flexible", "setDetailPage");
		}
	});
});
