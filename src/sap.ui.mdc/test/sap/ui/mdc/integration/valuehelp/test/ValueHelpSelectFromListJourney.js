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
	});

	opaTest("Reopen F4, change ColSearch and select from SingleMaster table", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		Then.onTheOPAPage.iShouldSeeTheValueHelpDialog();

		When.onTheOPAPage.iNavigateToValueHelpContent({title: "Search Template 1"});
		When.onTheOPAPage.iToggleTheValueHelpListItem("Twain, Mark");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "Twain, Mark (106)");

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

	opaTest("Navigation between tabs", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		Then.onTheOPAPage.iShouldSeeValueHelpContent({label: "My Define Conditions Panel"});
		When.onTheOPAPage.iNavigateToValueHelpContent({title: "Default Search Template"});
		Then.onTheOPAPage.iShouldSeeValueHelpContent({title: "Default Search Template"});
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.iTeardownMyAppFrame();
	});

	var oFilterBarConfigs = {
		"Default FilterBar": "test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-2",
		"Dedicated FilterBar": "test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-4"
	};

	Object.keys(oFilterBarConfigs).forEach(function (sModuleName) {
		QUnit.module(sModuleName);

		opaTest("Initial conditions", function (Given, When, Then) {
			Given.iStartMyAppInAFrame(oFilterBarConfigs[sModuleName]);
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
			Then.iTeardownMyAppFrame();

		});
	});

	QUnit.module("MTable");

	opaTest("Considers filterconditions", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-5&maxconditions=1");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Sales Organization"});
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Distribution Channel"});
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Division"});

		// 1030
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Distribution Channel"}, "10", {keepFocus: true, clearTextFirst: true});
		Then.onTheOPAPage.iShouldSeeValueHelpListItems(["Distribution Channel 10 for 1030"]);
		When.onTheOPAPage.iToggleTheValueHelpListItem("Distribution Channel 10 for 1030");

		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Division"}, "02", {keepFocus: false, clearTextFirst: true});
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Division"}, "Division 02 for 1030 10 (02)");

		// 1010
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Division"}, "", {keepFocus: false, clearTextFirst: true});
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Sales Organization"}, "", {keepFocus: false, clearTextFirst: true});
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Distribution Channel"}, "10", {keepFocus: true, clearTextFirst: true});
		Then.onTheOPAPage.iShouldSeeValueHelpListItems(["Distribution Channel 10 for 1010"]);
		When.onTheOPAPage.iToggleTheValueHelpListItem("Distribution Channel 10 for 1010");

		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Division"}, "02", {keepFocus: false, clearTextFirst: true});
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Division"}, "Division 02 for 1010 10 (02)");
	});
});