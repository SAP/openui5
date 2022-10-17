sap.ui.define([
	"sap/m/App",
	"sap/m/MessagePage"
], function(App, MessagePage) {
	"use strict";

	var oApp = new App("myApp"),
		oMessagePage = new MessagePage({
			showHeader: false
		});

	oApp.addPage(oMessagePage);
	oApp.placeAt('content');
});
