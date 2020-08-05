sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/m/MessageToast"
], function (Controller, Core, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutSimple.controller.Detail", {
		onInit: function () {
			this.bus = Core.getEventBus();
		},
		handleDetailPress: function () {
			MessageToast.show("Loading end column...");
			this.bus.publish("flexible", "setDetailDetailPage");
		}
	});
});
