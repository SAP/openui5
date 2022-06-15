/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/testrecorder/Dialects",
	"sap/ui/util/Storage",
	"sap/ui/testrecorder/qunit/integration/pages/IFrameTree",
	"sap/ui/testrecorder/qunit/integration/pages/IFrameInspect",
	"sap/ui/testrecorder/qunit/integration/pages/App"
], function (opaTest, Dialects, Storage) {
	"use strict";

	var oLocalStorage = new Storage(Storage.Type.local, "sap-ui-test-recorder");
	oLocalStorage.removeAll();

	var mItems = [{
		text: "Button One",
		treeText: "Button",
		selector: {
			controlType: "sap.m.Button",
			properties: {text: "Button One"}
		}
	}, {
		// use only to change/clear highlighted control
		text: "Clear Selection",
		selector: {
			controlType: "sap.m.Button",
			properties: {text: "Clear Selection"}
		}
	}, {
		text: "Button With ID",
		selector: {
			viewId: {
				id: "stableId",
				viewId: "container-myComponent---main"
			},
			globalId: {
				id: "container-myComponent---main--stableId"
			}
		}
	}, {
		text: "DatePicker",
		treeText: "DatePicker",
		selector: {
			id: "container-myComponent---main--DatePickerOne-RP-popover"
		}
	}];

	QUnit.module("Control inspection -- select from app");

	opaTest("Should open the recorder", function (Given, When, Then) {
		Given.iStartMyMockApp().and.iStartRecorder();
	});

	opaTest("Should interact with control in app - RAW", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[1].selector, "Highlight"); // clear
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.RAW);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		Then.onTheIFrameTreePage.iShouldSeeTheHighlightedItem(mItems[0].treeText);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.RAW, "Highlight");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.RAW, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.RAW, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);
	});

	opaTest("Should interact with control in app - OPA5", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[1].selector, "Highlight"); // clear
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		Then.onTheIFrameTreePage.iShouldSeeTheHighlightedItem(mItems[0].treeText);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.OPA5, "Highlight");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.OPA5, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.OPA5, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);
	});

	opaTest("Should interact with control in app - UIVERI5", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[1].selector, "Highlight"); // clear
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.UIVERI5);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		Then.onTheIFrameTreePage.iShouldSeeTheHighlightedItem(mItems[0].treeText);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.UIVERI5, "Highlight");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.UIVERI5, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.UIVERI5, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);
	});

	opaTest("Should interact with control in app - WDI5", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[1].selector, "Highlight"); // clear
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.WDI5);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		Then.onTheIFrameTreePage.iShouldSeeTheHighlightedItem(mItems[0].treeText);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.WDI5, "Highlight");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.WDI5, "Press");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.WDI5, "Enter Text");
		Then.onTheIFrameInspectPage.iShouldSeeItemOwnProperties(mItems[0].text);
	});

	opaTest("Should interact with control in tree", function (Given, When, Then) {
		When.onTheIFrameTreePage.iSelectItem(mItems[0].text);
		Then.onTheAppPage.iShouldSeeTheSelectedControl(mItems[0].selector);
	});

	opaTest("Should switch between snippet dialects - selector only", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.RAW);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.RAW);

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.OPA5);

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.UIVERI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.UIVERI5);

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.WDI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.WDI5);
	});

	opaTest("Should switch between snippet dialects - selector and action", function (Given, When, Then) {
		When.onTheIFrameTreePage.iSelectActionWithItem(mItems[0].treeText, "Press");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.RAW);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.RAW, "Press");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.OPA5, "Press");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.UIVERI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.UIVERI5, "Press");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.WDI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.WDI5, "Press");

		When.onTheIFrameTreePage.iSelectActionWithItem(mItems[0].treeText, "Enter Text");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.RAW);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.RAW, "Enter Text");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.OPA5, "Enter Text");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.UIVERI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.UIVERI5, "Enter Text");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.WDI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.WDI5, "Enter Text");
	});

	opaTest("Should change preference of view ID over global ID", function (Given, When, Then) {
		// should be disabled by default -> click once to enable
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);
		When.onTheIFrameInspectPage.iOpenTheSettingsDialog();
		When.onTheIFrameInspectPage.iSelectViewIdPreference();

		When.onTheAppPage.iActOnControl(mItems[2].selector.viewId, "Highlight");
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[2].text + " -- viewId", Dialects.OPA5, "Highlight");

		// reset setting to disabled
		When.onTheIFrameInspectPage.iOpenTheSettingsDialog();
		When.onTheIFrameInspectPage.iSelectViewIdPreference();

		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[2].text + " -- globalId", Dialects.OPA5, "Highlight");
	});

	opaTest("Should change PO method setting", function (Given, When, Then) {
		// should be enabled by default -> click once to disable
		When.onTheIFrameInspectPage.iOpenTheSettingsDialog();
		When.onTheIFrameInspectPage.iSelectPOMethodPreference();
		When.onTheAppPage.iActOnControl(mItems[2].selector.viewId, "Highlight");

		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[2].text + " -- noPOMethod", Dialects.OPA5, "Highlight");

		// reset setting to enabled
		When.onTheIFrameInspectPage.iOpenTheSettingsDialog();
		When.onTheIFrameInspectPage.iSelectPOMethodPreference();
	});

	opaTest("Should show multiple snippets", function (Given, When, Then) {
		When.onTheIFrameInspectPage.iClearSnippets(); // clear values from with previous tests
		When.onTheIFrameInspectPage.iSwitchMultiple();

		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		When.onTheAppPage.iActOnControl(mItems[2].selector.globalId, "Highlight");

		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet("multi", Dialects.OPA5, "Highlight");

		When.onTheIFrameInspectPage.iSwitchMultiple();
	});

	opaTest("Should update properties of selected control", function (Given, When, Then) {
		var mTestData = {
			selector: {
				controlType: "sap.m.Input"
			},
			prop: "value",
			newValue: "Some Text"
		};
		When.onTheAppPage.iActOnControl(mTestData.selector, "Highlight");
		Then.onTheIFrameInspectPage.iShouldSeeItemProperty(mTestData.prop, "");

		When.onTheAppPage.iEnterText(mTestData.selector, mTestData.newValue);
		Then.onTheIFrameInspectPage.iShouldSeeItemProperty(mTestData.prop, mTestData.newValue);
	});

	opaTest("Should assert a property", function (Given, When, Then) {
		When.onTheAppPage.iActOnControl(mItems[0].selector, "Highlight");
		When.onTheIFrameInspectPage.iAssertProperty(mItems[0].text);
		// OPA5 is default dialect
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.OPA5, "Assert");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.UIVERI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.UIVERI5, "Assert");

		When.onTheIFrameInspectPage.iSelectDialect(Dialects.WDI5);
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[0].text, Dialects.WDI5, "Assert");
	});

	opaTest("Should interact with sap.m.DatePicker", function (Given, When, Then) {
		When.onTheIFrameInspectPage.iSelectDialect(Dialects.OPA5);
		When.onTheAppPage.iOpenTheDatePicker();
		When.onTheAppPage.iActOnControl(mItems[3].selector, "Highlight");
		Then.onTheAppPage.iShouldSeeTheSelectedControl(mItems[3].selector); // control should still be open after action
		Then.onTheIFrameInspectPage.iShouldSeeItemCodeSnippet(mItems[3].text, Dialects.OPA5, "Highlight");

		Then.iTeardownMyApp();
	});
});
