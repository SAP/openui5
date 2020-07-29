/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - Filter Items");

	//*****************************************************************************
	opaTest("Check if item filter is working", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
			}
		});

		When.onMainPage.showSalesOrder("105");
		Then.onMainPage.checkSalesOrderLoaded("105");
		Then.onMainPage.checkSalesOrderItemsLoaded("105");

		[{
			filterKey : "With any message",
			valueState : ["Error", "Warning", "Information", "Success"]
		}, {
			filterKey : "Error",
			valueState : "Error"
		}, {
			filterKey : "Warning",
			valueState : "Warning"
		}, {
			filterKey : "Success",
			valueState : "Success"
		}, {
			filterKey : "Information",
			valueState : "Information"
		}].forEach(function(oFixture) {
			When.onMainPage.setFilter(oFixture.filterKey);

			if (oFixture.filterKey === "Warning" || oFixture.filterKey === "Success") {
				Then.onMainPage.checkDialogOpen("Information");
				When.onMainPage.closeDialog("Information");
				Then.onMainPage.checkFilterReset();
			} else {
				Then.onMainPage.checkItemsMatchingFilter(oFixture.valueState);
			}
		});

		Given.iTeardownMyApp();
	});
});