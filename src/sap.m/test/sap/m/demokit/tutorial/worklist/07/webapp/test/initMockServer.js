sap.ui.define([
	"mycompany/myapp/MyWorklistApp/localService/mockserver",
	"sap/m/MessageBox"
], function (mockserver, MessageBox) {
	"use strict";

	var aMockservers = [];

	// initialize the mock server
	aMockservers.push(mockserver.init());

	Promise.all(aMockservers).catch(function (oError) {
		MessageBox.error(oError.message);
	}).finally(function () {
		// initialize the embedded component on the HTML page
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	});

});