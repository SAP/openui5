/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/Create",
	"sap/ui/test/opaQunit"
], function (CreateTest, opaTest) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - Create", {
		before : function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		after : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*****************************************************************************
	opaTest("Create, modify and delete", function (Given, When, Then) {

		CreateTest.create(Given, When, Then);

	});
});