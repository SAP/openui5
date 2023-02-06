/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	"sap/ui/events/KeyCodes",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary",
	'sap/ui/v4demo/test/pages/Opa'

], function (Opa5, opaTest, KeyCodes, TestLibrary, OpaPage) {
	'use strict';

	Opa5.extendConfig({
		timeout: 60,
		autoWait: true
	});

	QUnit.module("Dialog");

	opaTest("DefineConditions Panel is navigatable / visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-2&maxconditions=-1");
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		Then.onTheOPAPage.iShouldSeeValueHelpContent({label: "My Define Conditions Panel"});
	});

	opaTest("I can create a condition", function (Given, When, Then) {
		When.onTheOPAPage.iEnterDefineConditionValuesInRow(0, "5");
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "=5");
	});

	opaTest("I can create another condition with a different operator", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		When.onTheOPAPage.iAddADefineConditionRow();
		When.onTheOPAPage.iChangeDefineConditionOperatorInRow(1, "BT");
		When.onTheOPAPage.iEnterDefineConditionValuesInRow(1, ["5", "10"]);
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, ["=5","5...10"]);
	});

	opaTest("I can remove a condition row", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		When.onTheOPAPage.iRemoveDefineConditionRow(1);
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "=5");
	});

	opaTest("I can create a condition via Typeahead selection", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		When.onTheOPAPage.iOpenTheValueHelpForField("__conditions0-DCP--0-values0");
		When.onTheOPAPage.iToggleTheValueHelpListItem("Carroll, Lewis", "FH4_DEFCOND");
		When.onTheOPAPage.iConfirmDefineConditionRowValues();
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "=103");
	});

	opaTest("I can remove conditions by removing all tokens at once", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		When.onTheOPAPage.iRemoveValueHelpToken("=103");
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, []);
	});

	opaTest("I can remove all tokens at once", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		When.onTheOPAPage.iAddADefineConditionRow();
		When.onTheOPAPage.iAddADefineConditionRow();
		When.onTheOPAPage.iEnterDefineConditionValuesInRow(0, 1);
		When.onTheOPAPage.iEnterDefineConditionValuesInRow(1, 2);
		When.onTheOPAPage.iEnterDefineConditionValuesInRow(2, 3);

		When.onTheOPAPage.iCloseTheValueHelpDialog();

		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, ["=1", "=2", "=3"]);

		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		When.onTheOPAPage.iRemoveAllValueHelpTokens();
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, []);

		Then.iTeardownMyAppFrame();
	});


	QUnit.module("Popover");

	opaTest("DefineConditions Panel is visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-3&maxconditions=-1");
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		Then.onTheOPAPage.iShouldSeeValueHelpContent({label: "My Define Conditions Panel"});
	});

	opaTest("I can create a condition", function (Given, When, Then) {
		When.onTheOPAPage.iEnterDefineConditionValuesInRow(0, 5);
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "=5");
	});

	opaTest("I can create another condition with a different operator", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iAddADefineConditionRow();
		When.onTheOPAPage.iChangeDefineConditionOperatorInRow(1, "BT");
		When.onTheOPAPage.iEnterDefineConditionValuesInRow(1, [5,10]);
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, ["=5","5...10"]);
	});

	opaTest("I can remove a condition row", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iRemoveDefineConditionRow(1);
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "=5");
	});

	opaTest("I can create a condition via Typeahead selection", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iOpenTheValueHelpForField("__conditions0-DCP--0-values0");

		When.onTheOPAPage.iToggleTheValueHelpListItem("Carroll, Lewis", "FH4_DEFCOND");
		When.onTheOPAPage.iConfirmDefineConditionRowValues();
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "=103");
		Then.iTeardownMyAppFrame();
	});

});



