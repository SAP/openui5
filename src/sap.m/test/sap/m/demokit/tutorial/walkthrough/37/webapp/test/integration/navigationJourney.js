/*global QUnit*/
/*global opaTest*/

sap.ui.require([
	"sap/ui/test/opaQunit"
], function () {
	"use strict";

	QUnit.module("Navigation");

	opaTest("Should open the hello dialog", function (Given, When, Then) {

		// Arrangements
		Given.iStartMyAppInAFrame(jQuery.sap.getResourcePath("sap/ui/demo/app/test", ".html"));

		//Actions
		When.onTheAppPage.iPressTheSayHelloWithDialogButton();

		// Assertions
		Then.onTheAppPage.iShouldSeeTheHelloDialog().
			and.iTeardownMyAppFrame();
	});
});

