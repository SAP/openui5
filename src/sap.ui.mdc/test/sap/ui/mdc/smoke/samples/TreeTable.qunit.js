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
		}
	});

	const sSampleResource = "test-resources/sap/ui/mdc/demokit/sample/table/TreeTable/index.html";
	const sTableId = "container-mdc.sample---sample--table";

	opaTest("A table is properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Then.onTheApp.iShouldSeeATable(sTableId);
		Then.onTheApp.iCheckBindingLength(sTableId, 4);
	});

	opaTest("Expand rows", function (Given, When, Then) {
		When.onTheApp.iPressExpandRowButton(sTableId, {index: 0});
		Then.onTheApp.iCheckBindingLength(sTableId, 8);

		When.onTheApp.iPressExpandRowButton(sTableId, {index: 1});
		Then.onTheApp.iCheckBindingLength(sTableId, 12);

		When.onTheApp.iPressExpandRowButton(sTableId, {index: 2});
		Then.onTheApp.iCheckBindingLength(sTableId, 15);
	});

	opaTest("Collapse rows", function (Given, When, Then) {
		When.onTheApp.iPressCollapseRowButton(sTableId, {index: 2});
		Then.onTheApp.iCheckBindingLength(sTableId, 12);

		When.onTheApp.iPressCollapseRowButton(sTableId, {index: 1});
		Then.onTheApp.iCheckBindingLength(sTableId, 8);

		When.onTheApp.iPressCollapseRowButton(sTableId, {index: 0});
		Then.onTheApp.iCheckBindingLength(sTableId, 4);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});