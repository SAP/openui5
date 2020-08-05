/*global QUnit*/

sap.ui.define(
	['sap/ui/test/opaQunit',
		'sap/ui/test/Opa5'],
	function (opaTest) {
		"use strict";
		QUnit.module("Hours View");
		opaTest("Focus on Hours when right arrow is used", function (Given, When, Then) {
			Given.iStartMyApp();
			When.iPressOnRightArrow();
			Then.iShouldCheckThatNextButtonOnHoursViewIsPressed();
		});

		QUnit.module("Days View");
		opaTest("Focus on Day when right arrow is used", function(Given, When, Then) {
			When.iChooseViewSelect();
			When.iChangeToDaysView();
			When.iPressOnRightArrow();
			Then.iShouldCheckThatNextButtonOnDaysViewIsPressed();
		});
		QUnit.module("Months View");
		opaTest("Focus on Month when right arrow is used", function (Given, When, Then) {
			When.iChooseViewSelect();
			When.iChangeToMonthsView();
			When.iPressOnRightArrow();
			Then.iShouldCheckThatNextButtonOnMonthsViewIsPressed();
		});
		QUnit.module("Week View");
		opaTest("Focus on Day when right arrow is used", function (Given, When, Then) {
			When.iChooseViewSelect();
			When.iChangeToWeekView();
			When.iPressOnRightArrow();
			Then.iShouldCheckThatNextButtonOnWeekViewIsPressed();
		});
		QUnit.module("1Month View");
		opaTest("Focus on Day when right arrow is used", function (Given, When, Then) {
			When.iChooseViewSelect();
			When.iChangeToOneMonthView();
			When.iPressOnRightArrow();
			Then.iShouldCheckThatNextButtonOn1MonthViewIsPressed().and.iTeardownMyAppFrame();
		});
	}
);