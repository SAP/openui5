/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/tests/AdaptSalesOrdersTable",
	"sap/ui/test/opaQunit"
], function (AdaptSalesOrdersTable, opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrdersRTATest - Adapt UI SalesORdersTble");

	//*****************************************************************************
	opaTest("Adapt UI SalesOrdersTable", function (Given, When, Then) {

		AdaptSalesOrdersTable.AdaptSalesOrdersTable(Given, When, Then,
			"sap.ui.core.sample.odata.v4.SalesOrdersRTATest");

	});
});
