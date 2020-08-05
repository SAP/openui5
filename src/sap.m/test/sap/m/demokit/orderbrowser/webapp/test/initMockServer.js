sap.ui.define([
	"sap/ui/demo/orderbrowser/localService/mockserver"
], function (mockserver) {
	"use strict";

	var aMockservers = [];

	// initialize the mock server
	aMockservers.push(mockserver.init());

	Promise.all(aMockservers).then(function () {
		// initialize the embedded component on the HTML page
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	});
});
