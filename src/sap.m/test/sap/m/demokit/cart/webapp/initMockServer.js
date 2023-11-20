sap.ui.define([
	"sap/ui/demo/cart/localService/mockserver"
], function (mockserver) {
	"use strict";

	// initialize the mock server
	mockserver.init().catch(function (oError) {
		// load MessageBox only when needed as it otherwise bypasses the preload of sap.m
		sap.ui.require(["sap/m/MessageBox"], function(MessageBox) {
			MessageBox.error(oError.message);
		});
	}).finally(function () {
		// initialize the embedded component on the HTML page
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	});

});
