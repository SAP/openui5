/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/additionalTargets",
	"sap/ui/test/opaQunit"
], function (Helper, additionalTargets, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - Additional Targets");

	//*****************************************************************************
	opaTest("Additional targets", function (Given, When, Then) {
		additionalTargets(Given, When, Then);
	});
});
