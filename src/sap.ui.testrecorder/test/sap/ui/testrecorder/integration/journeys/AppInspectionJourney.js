/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/testrecorder/Dialects",
	"sap/ui/util/Storage",
	"sap/ui/testrecorder/integration/pages/IFrameTree",
	"sap/ui/testrecorder/integration/pages/IFrameInspect",
	"sap/ui/testrecorder/integration/pages/App"
], function (opaTest, Dialects, Storage) {
	"use strict";

	var oLocalStorage = new Storage(Storage.Type.local, "sap-ui-test-recorder");
	oLocalStorage.removeAll();

	var mItems = [{
		id: "__xmlview0--firstButton", // could change when mock app is changed -- use sparingly
		text: "Button",
		selector: {
			controlType: "sap.m.Button",
			properties: {text: "Button One"}
		}
	}, {
		// use only to change/clear highlighted control
		id: "__xmlview0--clear",
		selector: {
			controlType: "sap.m.Button",
			properties: {text: "Clear Selection"}
		}
	}];

	QUnit.module("Control Inspector -- select from app");

	opaTest("Should open the recorder", function (Given, When, Then) {
		Given.iStartMyMockApp().and.iStartRecorder();
	});

	opaTest("Should interact with control in app - RAW", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[1].selector, "Highlight"); // clear
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.RAW);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		Then.onTheIFrameTreePage.iShouldSeeTheHighlightedItem(mItems[0].text);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.RAW, "Highlight");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.RAW, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.RAW, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);
	});

	opaTest("Should interact with control in app - OPA5", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[1].selector, "Highlight"); // clear
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		Then.onTheIFrameTreePage.iShouldSeeTheHighlightedItem(mItems[0].text);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.OPA5, "Highlight");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.OPA5, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.OPA5, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);
	});

	opaTest("Should interact with control in app - UIVERI5", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[1].selector, "Highlight"); // clear
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.UIVERI5);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		Then.onTheIFrameTreePage.iShouldSeeTheHighlightedItem(mItems[0].text);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.UIVERI5, "Highlight");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.UIVERI5, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.UIVERI5, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].id);
	});

	opaTest("Should interact with control in tree", function (Given, When, Then) {
		When.onTheIFrameTreePage.iSelectItem(mItems[0].text);
		Then.onTheAppPage.iShouldSeeTheSelectedControl(mItems[0].selector);
	});

	opaTest("Should should switch between snippet dialects - selector only", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.RAW);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.RAW);

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.OPA5);

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.UIVERI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.UIVERI5);
	});

	opaTest("Should should switch between snippet dialects - selector and action", function (Given, When, Then) {
		When.onTheIFrameTreePage.iSelectActionWithItem(mItems[0].text, "Press");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.RAW);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.RAW, "Press");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.OPA5, "Press");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.UIVERI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.UIVERI5, "Press");

		When.onTheIFrameTreePage.iSelectActionWithItem(mItems[0].text, "Enter Text");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.RAW);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.RAW, "Enter Text");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.OPA5, "Enter Text");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.UIVERI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].id, Dialects.UIVERI5, "Enter Text");

		Then.iTeardownMyApp();
	});

});
