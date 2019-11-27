/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/WriteNonDeferredGroup",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (WriteNonDeferredGroupTest, opaTest, TestUtils) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - " +
		"Write via application groups with SubmitMode.Auto/.Direct", {
		before : function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		after : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*****************************************************************************
	if (TestUtils.isRealOData()) {
		[
			"myAutoGroup", "$auto", "$auto.foo", "myDirectGroup", "$direct"
		].forEach(function (sGroupId) {
			opaTest("POST/PATCH SalesOrder via group: " + sGroupId,
				WriteNonDeferredGroupTest.writeNonDeferredGroup.bind(null, sGroupId,
					"sap.ui.core.sample.odata.v4.SalesOrdersRTATest"));
		});
	} else {
		QUnit.skip("Tests run only with realOData=true");
	}
});