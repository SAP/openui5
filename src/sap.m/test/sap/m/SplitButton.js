// Note: the HTML page 'SplitButton.html' loads this module via data-sap-ui-on-init

sap.ui.define(["sap/m/SplitButton", "sap/m/App", "sap/m/Page"], function(SplitButton, App, Page) {
	"use strict";
	new App().addPage(new Page({
		title: "sap.m.SplitButton",
		content: [
			new SplitButton({
				text: "abc",
				arrowPress: function(oEvent) {
					alert("arrow down: " + oEvent.getParameter('down'));
				},
				press: function() {
					alert("press");
				}
			})
		]
	})).placeAt("body");
});