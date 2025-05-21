/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/DataAggregation/tests/expandPageCollapse",
	"sap/ui/core/sample/odata/v4/DataAggregation/tests/filter",
	"sap/ui/test/opaQunit",
	"sap/ui/core/sample/odata/v4/DataAggregation/SandboxModel" // preload only
], function (Helper, expandPageCollapse, filter, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.DataAggregation");

	["", "true", "false"].forEach(function (sGrandTotalAtBottomOnly) {
		["", "true", "false"].forEach(function (sSubtotalsAtBottomOnly) {
			var sTitle = "expand, page, collapse"
					+ "; grand total at bottom only: " + sGrandTotalAtBottomOnly
					+ "; subtotals at bottom only: " + sSubtotalsAtBottomOnly;

			//*****************************************************************************
			opaTest(sTitle, expandPageCollapse.bind(null,
				sGrandTotalAtBottomOnly, sSubtotalsAtBottomOnly, ""));
		});
	});

	//*****************************************************************************
	opaTest("filter", filter);

	//*****************************************************************************
	opaTest("expand, page, collapse w/ leaf count", expandPageCollapse.bind(null, "", "", "true"));
});
