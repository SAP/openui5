/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/testrecorder/Dialects",
	"sap/ui/util/Storage",
	"sap/ui/testrecorder/qunit/integration/pages/Tree",
	"sap/ui/testrecorder/qunit/integration/pages/Inspect"
], function (opaTest, Dialects, Storage) {
	"use strict";

	var oLocalStorage = new Storage(Storage.Type.local, "sap-ui-test-recorder");
	oLocalStorage.removeAll();

	var mItems = [{
		id: "__button4-container-cart---welcomeView--row-1-img", // this should be a mocked response -> stable
		text: "Icon"
	}, {
		id: "sap-ui-static",
		text: "ui-area"
	}];

	QUnit.module("Control inspection - select from tree");

	opaTest("Should show a control's properties and bindings", function (Given, When, Then) {
		Given.iStartMyMockRecorder();

		When.onTheTreePage.iSelectItem(mItems[0].text);

		Then.onTheTreePage.iShouldSeeTheHighlightedItem(mItems[0].text);
		Then.onTheInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);
		Then.onTheInspectPage.iShouldSeeItemInheritedProperties(mItems[0].id);

		When.onTheInspectPage.iSelectTab("Bindings");
		Then.onTheInspectPage.iShouldSeeItemBindingContext(mItems[0].id);

		// reset selection
		When.onTheTreePage.iSelectItem(mItems[1].text);
	});

	opaTest("Should show a code snippet", function (Given, When, Then) {
		When.onTheTreePage.iSelectItem(mItems[0].text);

		Then.onTheTreePage.iShouldSeeTheHighlightedItem(mItems[0].text);
		Then.onTheInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id);

		// reset selection
		When.onTheTreePage.iSelectItem(mItems[1].text);
	});

	opaTest("Should include action - RAW", function (Given, When, Then) {
		When.onTheInspectPage.iSelectDialect(Dialects.RAW);
		When.onTheTreePage.iSelectActionWithItem(mItems[0].text, "Press");
		Then.onTheInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.RAW, "Press");

		When.onTheTreePage.iSelectActionWithItem(mItems[0].text, "Enter Text");
		Then.onTheInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.RAW, "Enter Text");
	});

	opaTest("Should include action - OPA5", function (Given, When, Then) {
		When.onTheInspectPage.iSelectDialect(Dialects.OPA5);
		When.onTheTreePage.iSelectActionWithItem(mItems[0].text, "Press");
		Then.onTheInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.OPA5, "Press");

		When.onTheTreePage.iSelectActionWithItem(mItems[0].text, "Enter Text");
		Then.onTheInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.OPA5, "Enter Text");
	});

	opaTest("Should include action - UIVERI5", function (Given, When, Then) {
		When.onTheInspectPage.iSelectDialect(Dialects.UIVERI5);
		When.onTheTreePage.iSelectActionWithItem(mItems[0].text, "Press");
		Then.onTheInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.UIVERI5, "Press");

		When.onTheTreePage.iSelectActionWithItem(mItems[0].text, "Enter Text");
		Then.onTheInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.UIVERI5, "Enter Text");
	});

	opaTest("Should preserve selected snippet dialect", function (Given, When, Then) {
		When.onTheInspectPage.iSelectDialect(Dialects.OPA5);

		Then.iTeardownMyApp();
		Given.iStartMyMockRecorder();

		Then.onTheInspectPage.iShouldSeeSelectedDialect(Dialects.OPA5);

		Then.iTeardownMyApp();
	});

});
