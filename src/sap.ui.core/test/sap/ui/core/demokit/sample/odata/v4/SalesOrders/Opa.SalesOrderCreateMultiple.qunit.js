/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/CreateMultiple",
	"sap/ui/test/opaQunit"
], function (CreateMultiple, opaQunit) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - Create Multiple");

	//*****************************************************************************
	opaQunit("Multiple create, modify and delete", function (Given, When, Then) {
		CreateMultiple.createMultiple(Given, When, Then);
	});
});