/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	"sap/ui/events/KeyCodes",
	'sap/ui/v4demo/test/pages/Opa'
], function (Opa5, opaTest, KeyCodes, OpaPage) {
	'use strict';

	Opa5.extendConfig({
		timeout: 60,
		autoWait: true
	});

	QUnit.module("Typeahead");

	opaTest("Typing raises fitting suggestions", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-1");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"});
		When.onTheOPAPage.iEnterTextOnTheFilterField("FB0-FF1-10", "aust", {keepFocus: true, clearTextFirst: false});
		Then.onTheOPAPage.iShouldSeeValueHelpListItems([
			["101", "Austen, Jane"],
			["373", "Craig, Austin"]
		]);
	});

	opaTest("Select and Confirm", function (Given, When, Then) {
		When.onTheOPAPage.iToggleTheValueHelpListItem("Craig, Austin");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "Craig, Austin (373)");
	});

	opaTest("Escape key hides suggestions", function (Given, When, Then) {
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "TestField"}, "aust", {keepFocus: true, clearTextFirst: true});
		When.onTheOPAPage.iPressKeyOnTheFilterField({label: "TestField"}, KeyCodes.ESCAPE);
		Then.onTheOPAPage.iShouldNotSeeTheValueHelp();
	});

	QUnit.module("Dialog");

	opaTest("F4 opens VH Dialog", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		Then.onTheOPAPage.iShouldSeeTheValueHelpDialog();

	});

	opaTest("Select and Confirm", function (Given, When, Then) {
		When.onTheOPAPage.iToggleTheValueHelpListItem("Carroll, Lewis");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "Carroll, Lewis (103)");
		Then.iTeardownMyAppFrame();

	});

	opaTest("MultiSelect and Confirm", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-2");
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iToggleTheValueHelpListItem("Carroll, Lewis");
		When.onTheOPAPage.iToggleTheValueHelpListItem("Twain, Mark");
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, ["Carroll, Lewis (103)", "Twain, Mark (106)"]);

	});

	opaTest("De-select conditions by removing tokens", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iRemoveValueHelpToken("Twain, Mark (106)");
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "Carroll, Lewis (103)");
	});

	opaTest("De-select conditions by removing all tokens at once", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iToggleTheValueHelpListItem("Twain, Mark");
		When.onTheOPAPage.iToggleTheValueHelpListItem("Kafka, Franz");

		When.onTheOPAPage.iCloseTheValueHelpDialog();

		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, ["Carroll, Lewis (103)", "Twain, Mark (106)", "Kafka, Franz (105)"]);

		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iRemoveAllValueHelpTokens();
		When.onTheOPAPage.iCloseTheValueHelpDialog();

		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, []);
	});

	opaTest("Initial conditions", function (Given, When, Then) {
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "TestField"}, "doug", {keepFocus: true, clearTextFirst: true});
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		Then.onTheOPAPage.iShouldSeeTheValueHelpDialogSearchField("doug");
		Then.onTheOPAPage.iShouldSeeValueHelpListItems("Douglass, Frederick");

	});

	opaTest("Reverting to initial conditions ", function (Given, When, Then) {
		When.onTheOPAPage.iEnterTextOnTheValueHelpDialogSearchField("carrol", {keepFocus: true, clearTextFirst: true, pressEnterKey: true});
		Then.onTheOPAPage.iShouldSeeValueHelpListItems("Carroll, Lewis");
		When.onTheOPAPage.iCloseTheValueHelpDialog(true);
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		Then.onTheOPAPage.iShouldSeeTheValueHelpDialogSearchField("doug");
	});

	opaTest("Navigation between tabs", function (Given, When, Then) {
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		Then.onTheOPAPage.iShouldSeeValueHelpContent({label: "My Define Conditions Panel"});
		When.onTheOPAPage.iNavigateToValueHelpContent({title: "Default Search Template"});
		Then.onTheOPAPage.iShouldSeeValueHelpContent({title: "Default Search Template"});
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.iTeardownMyAppFrame();
	});
});