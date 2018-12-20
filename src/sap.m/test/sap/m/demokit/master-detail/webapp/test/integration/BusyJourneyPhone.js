/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/Device",
	"./pages/App",
	"./pages/Master"
], function (opaTest, Device) {
	"use strict";

	var iDelay = (Device.browser.msie || Device.browser.edge) ? 1500 : 1000;

	QUnit.module("Phone busy indication");

	opaTest("Should see a global busy indication while loading the metadata", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp({delay : iDelay});

		// Assertions
		Then.onTheAppPage.iShouldSeeTheBusyIndicator();
	});

	opaTest("Should see a busy indication on the master after loading the metadata", function (Given, When, Then) {
		// Assertions
		Then.onTheMasterPage.iShouldSeeTheBusyIndicator();

		//Cleanup
		Then.iTeardownMyApp();
	});

});
