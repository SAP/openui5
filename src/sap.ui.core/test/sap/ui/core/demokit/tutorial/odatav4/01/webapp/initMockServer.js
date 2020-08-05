sap.ui.define([
	"sap/ui/core/tutorial/odatav4/localService/mockserver",
	"sap/base/Log",
	"sap/m/MessageBox"
], function (mockserver, Log, MessageBox) {
	"use strict";

	// initialize the mock server
	mockserver.init().catch(function (oError) {
		MessageBox.error(oError.message);
	}).finally(function () {
		// initialize the embedded component on the HTML page
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	});
});