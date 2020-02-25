/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/WriteNonDeferredGroup",
	"sap/ui/test/opaQunit"
], function (Helper, WriteNonDeferredGroupTest, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - " +
		"Write via application groups with SubmitMode.Auto/.Direct");

	//*****************************************************************************
	[
		"myAutoGroup", "$auto", "$auto.foo", "myDirectGroup", "$direct"
	].forEach(function (sGroupId) {
		opaTest("POST/PATCH SalesOrder via group: " + sGroupId,
			WriteNonDeferredGroupTest.writeNonDeferredGroup.bind(null, sGroupId, ""));
	});
});
