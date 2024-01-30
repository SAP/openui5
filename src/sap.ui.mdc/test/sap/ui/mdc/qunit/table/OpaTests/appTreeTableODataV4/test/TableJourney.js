/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/Arrangements",
	"test-resources/sap/ui/mdc/qunit/table/OpaTests/pages/TestObjects"
], function(
	/** @type sap.ui.test.Opa5 */ Opa5,
	/** @type sap.ui.test.opaQunit */ opaTest,
	/** @type sap.ui.test.Opa5 */ Arrangements,
	/** @type sap.ui.test.PageObjectDefinition */ TestObjects
	) {
	"use strict";

	Opa5.extendConfig({
		viewNamespace: "appTreeTableODataV4",
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

	const sTableId = "container-appTreeTableODataV4---MyView--MDCTreeTableV4";

	QUnit.module("TreeTable Table OpaTests");

	opaTest("After starting the OPA tests and I look at the screen I should see an TreeTable", function(Given, When, Then) {
		Given.iStartMyApp("appTreeTableODataV4");
		When.onTheApp.iLookAtTheScreen();
		Then.onTheApp.iShouldSeeATable(sTableId);
	});

	opaTest("The table should have a title", function(Given, When, Then) {
		Then.onTheAppMDCTable.iShouldSeeTheHeaderText(sTableId, "Products");
	});

	opaTest("Change some column positions", function(Given, When, Then) {
		Then.onTheAppMDCTable.iCheckColumnPosition(sTableId, "container-appTreeTableODataV4---MyView--Name", 1);
		When.onTheAppMDCTable.iDragColumn(sTableId, 1);
		When.onTheAppMDCTable.iDropColumnAfter(sTableId, 3);
		Then.onTheAppMDCTable.iCheckColumnPosition(sTableId, "container-appTreeTableODataV4---MyView--Name", 3);

		Then.onTheAppMDCTable.iCheckColumnPosition(sTableId, "container-appTreeTableODataV4---MyView--ID", 0);
		When.onTheAppMDCTable.iDragColumn(sTableId, 0);
		When.onTheAppMDCTable.iDropColumnAfter(sTableId, 2);
		Then.onTheAppMDCTable.iCheckColumnPosition(sTableId, "container-appTreeTableODataV4---MyView--ID", 0);
	});

	opaTest("Expand and collapse some rows", function(Given, When, Then) {
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 6);

		When.onTheAppMDCTable.iClickOnCollapseAllRowsButton(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 1);

		When.onTheAppMDCTable.iClickOnExpandAllRowsButton(sTableId);
		Then.onTheAppMDCTable.iCheckBindingLength(sTableId, 24);

		Then.iTeardownMyAppFrame();
	});
});