/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function (opaTest, Opa5) {
	"use strict";

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
				Then.onMainPage.checkDialogOpen();
				When.onMainPage.closeDialog();
				Then.onMainPage.checkFilterReset();
			} else {
				Then.onMainPage.checkItemsMatchingFilter(oFixture.valueState);
			}
		});

		Given.iTeardownMyApp();
	});
});