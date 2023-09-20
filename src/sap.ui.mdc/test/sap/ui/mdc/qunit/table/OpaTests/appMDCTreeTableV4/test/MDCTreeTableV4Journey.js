/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Arrangements",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/AppUnderTestMDCTable"
], function(
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.opaQunit */ opaTest,
	/** @type sap.ui.test.Opa5 */ Arrangements,
	/** @type sap.ui.test.PageObjectDefinition */ TestObjects
	) {
	"use strict";

	if (window.blanket) {
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		viewNamespace: "appMDCTreeTableV4",
		arrangements: new Arrangements(),
		autoWait: true,
		async: true,
		timeout: 40,
		debugTimeout: 40,
		pollingInterval: 10,
		appParams: {
			"sap-ui-animation": false
		}
	});

	const sTableId = "container-appMDCTreeTableV4---MyView--MDCTreeTableV4";

	QUnit.module("TreeTable Table OpaTests");

	opaTest("After starting the OPA tests and I look at the screen I should see an TreeTable", function(Given, When, Then) {
		//insert application
		Given.iStartMyApp("appMDCTreeTableV4");
		When.onTheAppUnderTestMDCTable.iLookAtTheScreen();
		Then.onTheAppUnderTestMDCTable.iShouldSeeATable(sTableId);
	});

	opaTest("The table should have a title", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iShouldSeeTheHeaderText(sTableId, "Products");
	});

	opaTest("Change some column positions", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iCheckColumnPosition(sTableId, "container-appMDCTreeTableV4---MyView--Name", 1);
		When.onTheAppUnderTestMDCTable.iDragColumn(sTableId, 1);
		When.onTheAppUnderTestMDCTable.iDropColumnAfter(sTableId, 3);
		Then.onTheAppUnderTestMDCTable.iCheckColumnPosition(sTableId, "container-appMDCTreeTableV4---MyView--Name", 3);

		Then.onTheAppUnderTestMDCTable.iCheckColumnPosition(sTableId, "container-appMDCTreeTableV4---MyView--ID", 0);
		When.onTheAppUnderTestMDCTable.iDragColumn(sTableId, 0);
		When.onTheAppUnderTestMDCTable.iDropColumnAfter(sTableId, 2);
		Then.onTheAppUnderTestMDCTable.iCheckColumnPosition(sTableId, "container-appMDCTreeTableV4---MyView--ID", 0);
	});

	opaTest("Expand and collapse some rows", function(Given, When, Then) {
		Then.onTheAppUnderTestMDCTable.iCheckBindingLength(sTableId, 10);

		When.onTheAppUnderTestMDCTable.iClickOnCollapseAllRowsButton(sTableId);
		Then.onTheAppUnderTestMDCTable.iCheckBindingLength(sTableId, 1);

		When.onTheAppUnderTestMDCTable.iClickOnExpandAllRowsButton(sTableId);
		Then.onTheAppUnderTestMDCTable.iCheckBindingLength(sTableId, 10);
		// Teardown
		Then.onTheAppUnderTestMDCTable.iTeardownMyAppFrame();
	});
});