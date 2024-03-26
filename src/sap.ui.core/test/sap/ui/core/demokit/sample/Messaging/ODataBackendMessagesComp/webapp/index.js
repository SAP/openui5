sap.ui.define([
	"./localService/mockserver",
	"sap/m/Shell",
	"sap/ui/core/ComponentContainer"
], function (mockserver, Shell, ComponentContainer) {
	"use strict";

	mockserver.init();
	new Shell({
		app: new ComponentContainer({
			name: "sap.ui.core.sample.Messaging.ODataBackendMessagesComp",
			height: "100%",
			manifest: true
		})
	}).placeAt("content");
});
