/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/MessageHandling",
	"sap/ui/test/opaQunit"
], function (MessageHandling, opaTest) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - Message Handling", {
		before : function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		after : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*****************************************************************************
	opaTest("Message Handling", function (Given, When, Then) {

		MessageHandling.checkMessages(Given, When, Then);

	});
});