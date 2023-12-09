sap.ui.define([
	"../localService/mockserver",
	"sap/ui/core/Lib"
], function(mockserver, Library) {
	"use strict";

	var aMockservers = [];

	// initialize the mock server
	aMockservers.push(mockserver.init());

	Promise.all(aMockservers).catch(function (oError) {
		var fnShowErrorMessage = function () {
			return new Promise(function (resolve, reject) {
				sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
					MessageBox.error(oError.message);
					resolve();
				}, reject);
			});
		};
		return Library.load("sap.m").then(fnShowErrorMessage);
	}).finally(function () {
		// initialize the embedded component on the HTML page
		sap.ui.require(["sap/ui/core/ComponentSupport"]);
	});
});