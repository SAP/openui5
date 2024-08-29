sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	"test-resources/sap/ui/mdc/testutils/opa/filterfield/Actions",
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function (Opa5, opaTest, P13nAssertion, FilterFieldActions, App, TestLibrary) {
	"use strict";

	Opa5.extendConfig({
		assertions: new P13nAssertion(),
		actions: {...FilterFieldActions },
		autoWait: true,
		appParams: {
			"sap-ui-animation": false
		},
		timeout: 100,
		asyncPolling: true
	});

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/table/TableTypes/index.html";
	const sPrefixDialog = "configurationDialog--";
	const sTableId = "container-mdc.sample---sample--table";
	const sConfigButtonId = "container-mdc.sample---sample--btnConfig";
	const sSwitchTypeButtonId = "container-mdc.sample---sample--btnType";

	opaTest("A GridTable is properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheApp.iShouldSeeATable(sTableId);
		Then.onTheApp.iShouldSeeTableType(sTableId, "sap.ui.table.Table");
	});

	opaTest("Changing GridTable settings", function(Given, When, Then) {
		When.onTheApp.iOpenTableTypeConfiguration(sConfigButtonId);
		When.onTheApp.iEnterNumberInStepInput(`${sPrefixDialog}fixedColumnCount`, 1);
		When.onTheApp.iEnterNumberInStepInput(`${sPrefixDialog}rowCount`, 5);
		When.onTheApp.iEnterTextInInput(`${sPrefixDialog}rowCountMode`, "Fixed");
		When.onTheApp.iEnterNumberInStepInput(`${sPrefixDialog}scrollThreshold`, 10);
		When.onTheApp.iEnterNumberInStepInput(`${sPrefixDialog}selectionLimit`, 10);
		When.onTheApp.iCloseConfigurationDialog(`${sPrefixDialog}gridTableTypeDialog`);

		Then.onTheApp.iShouldSeeTableWithConfig(sTableId, "sap.ui.table.Table",{
			fixedColumnCount: {type: "control", value: 1},
			rowCount: {type: "rowMode", value: 5},
			rowCountMode:  {type: "rowMode", value: "sap.ui.table.rowmodes.Fixed"},
			scrollThreshold: {type: "control", value: 10},
			limit: {type: "selection", value: 10}
		});
	});

	opaTest("Change table type to ResponsiveTableType", function(Given, When, Then) {
		When.onTheApp.iSwitchTableType(sSwitchTypeButtonId, "ResponsiveTableType");
		Then.onTheApp.iShouldSeeTableType(sTableId, "sap.m.Table");
	});

	opaTest("Changing ResponsiveTable settings", function(Given, When, Then) {
		When.onTheApp.iOpenTableTypeConfiguration(sConfigButtonId);
		When.onTheApp.iEnterTextInInput(`${sPrefixDialog}growingMode`, "Scroll");
		When.onTheApp.iEnterTextInInput(`${sPrefixDialog}popinLayout`, "GridSmall");
		When.onTheApp.iCloseConfigurationDialog(`${sPrefixDialog}respTableTypeDialog`);

		Then.onTheApp.iShouldSeeTableWithConfig(sTableId, "sap.m.Table",{
			growingScrollToLoad: {type: "control", value: true},
			popinLayout:  {type: "control", value: "GridSmall"}
		});
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});