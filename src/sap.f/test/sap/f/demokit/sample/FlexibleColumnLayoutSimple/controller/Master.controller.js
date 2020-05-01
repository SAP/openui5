sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/m/MessageToast"
], function (Controller, Core, MessageToast) {
	"use strict";

	return Controller.extend("sap.f.sample.FlexibleColumnLayoutSimple.controller.Master", {
		onInit: function () {
			this.bus = Core.getEventBus();
		},
		handleMasterPress: function () {
			MessageToast.show("Loading mid column...");
			this.bus.publish("flexible", "setDetailPage");
		}
	});
});
