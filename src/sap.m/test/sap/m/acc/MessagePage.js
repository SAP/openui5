sap.ui.define([
	"sap/m/App"
], function(App) {
	"use strict";

	var oApp = new App("myApp"),
		oMessagePage = new undefined/*MessagePage*/({
			showHeader: false
		});

	oApp.addPage(oMessagePage);
	oApp.placeAt('content');
});
