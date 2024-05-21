sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	"test-resources/sap/ui/mdc/smoke/samples/pages/App",
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

	const sSampleResource = "test-resources/sap/m/demokit/sample/p13n/EngineCustomFilters/index.html";

	opaTest("A table is properly visible", function (Given, When, Then) {
		Given.iStartMyAppInAFrame(sSampleResource);
		Opa5.assert.ok(true);
	});

	opaTest("App teardown successful", function (Given, When, Then) {
		Then.iTeardownMyApp();
		Opa5.assert.ok(true);
	});
});