sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	"test-resources/sap/m/qunit/p13n/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, P13nAction, P13nAssertion, App, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		actions: new P13nAction(),
		assertions: new P13nAssertion(),
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sButton = "__xmlview0--openBtn";
	const sRadioButtonGroupTop = "__xmlview0--dialogChose";
	const sRadioButtonGroupBottom = "__xmlview0--layoutType";

	const sSampleResource = "test-resources/sap/m/demokit/sample/p13n/Container/index.html";

	opaTest("App starts up", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Opa5.assert.ok(true);
	});

	opaTest("Dialog - List is shown", function (Given, When, Then) {
		When.onTheApp.iPressTheButton(sButton);
		Then.thePersonalizationDialogOpens(false);
		Then.iShouldSeeListItemOnPosition("View 1", 0);
		Then.iShouldSeeListItemOnPosition("View 2", 1);
		Then.iShouldSeeListItemOnPosition("View 3", 2);
		When.iPressEscapeInDialog();
	});

	opaTest("Popover - List is shown", function (Given, When, Then) {
		When.onTheApp.iSelectValueInRadioButtonGroup(sRadioButtonGroupTop, 1);
		When.onTheApp.iPressTheButton(sButton);
		Then.thePersonalizationDialogOpens(true);
		When.iPressEscapeInDialog(true);
	});

	opaTest("Popover - IconTabBar is shown", function (Given, When, Then) {
		When.onTheApp.iSelectValueInRadioButtonGroup(sRadioButtonGroupBottom, 1);
		When.onTheApp.iPressTheButton(sButton);
		Then.thePersonalizationDialogOpens(true);
		When.iPressEscapeInDialog(true);
	});

	opaTest("Dialog - IconTabBar is shown", function (Given, When, Then) {
		When.onTheApp.iSelectValueInRadioButtonGroup(sRadioButtonGroupTop, 0);
		When.onTheApp.iPressTheButton(sButton);
		Then.thePersonalizationDialogOpens(false);
		When.iPressEscapeInDialog();
	});


	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});