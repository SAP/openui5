/*global QUnit*/

sap.ui.define(['sap/ui/test/opaQunit'], function (opaTest) {
	"use strict";

	QUnit.module("Download");

	opaTest("Should be able to download a sample", function (Given, When, Then) {
		Given.iStartTheExploredApp();

		When.onTheMasterPage.iPressOnTheEntity("OPA5");
		When.onTheEntityPage.iPressOnTheSample("Using Matchers");
		When.onTheSamplePage.iPressOnShowCode();

		Then.onTheCodePage.iCheckThatTheDownloadButtonWorks().
			and.iTeardownMyAppFrame();
	});
});
