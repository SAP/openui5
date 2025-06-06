sap.ui.define([
	"sap/ui/demo/cart/localService/mockserver"
], (mockserver) => {
	"use strict";

	// initialize the mock server
	mockserver.init().catch((oError) => {
		// load MessageBox only when needed as it otherwise bypasses the preload of sap.m
		sap.ui.require(["sap/m/MessageBox"], (MessageBox) => MessageBox.error(oError.message));
	}).finally(() => {
		// initialize the embedded component on the HTML page
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	});
});
