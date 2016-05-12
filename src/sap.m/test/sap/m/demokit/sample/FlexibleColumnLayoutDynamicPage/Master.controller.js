sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
], function (Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.FlexibleColumnLayoutDynamicPage.Master", {
		onInit: function () {
			this.bus = sap.ui.getCore().getEventBus();
		},
		handleMasterPress: function () {
			MessageToast.show("Loading mid column...");
			this.bus.publish("flexible", "setDetailPage");
		},
		deleteContentPressHandler: function () {
			this.getView().byId("masterPage").setContent(null);
			MessageToast.show("Page content deleted");
		}
	});
}, true);
