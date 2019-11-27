/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/odata/v4/SalesOrdersRTATest/tests/AdaptSalesOrdersTable",
	"sap/ui/test/opaQunit"
], function (AdaptSalesOrdersTable, opaTest) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrdersRTATest - Adapt UI SalesOrdersTable", {
		before : function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		after : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*****************************************************************************
	opaTest("Adapt UI SalesOrdersTable", function (Given, When, Then) {

		AdaptSalesOrdersTable.adaptSalesOrdersTable(Given, When, Then,
			"sap.ui.core.sample.odata.v4.SalesOrdersRTATest");

	});
});
