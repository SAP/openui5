/*global QUnit*/

sap.ui.require(
	["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("MainJourney");

		opaTest("Starting my App and do some base tests", function (Given, When, Then) {
			Given.iStartMyApp({autoWait: true, hash: "#sample/sap.m.sample.Switch"});
			Then.onTheAppView.theSampleSelectShouldBeShown();
		});
	}
);