/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	/*eslint max-nested-callbacks: 0 */
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/Helper",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/DataAggregation/pages/Main",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Helper, Any, Main, Opa5, opaTest, TestUtils) {

		Helper.qUnitModule("sap.ui.core.sample.odata.v4.DataAggregation");

		["", "true", "false"].forEach(function (sGrandTotalAtBottomOnly) {
			var sTitle = "Data aggregation with expand, paging, collapse"
					+ "; grand total at bottom only: " + sGrandTotalAtBottomOnly;

			//*****************************************************************************
			opaTest(sTitle, function (Given, When, Then) {
				var aAfterExpandBwSmall, aInitialTableState;

				function checkTable(aExpected) {
					aExpected = aExpected.slice(); // shallow copy
					if (sGrandTotalAtBottomOnly === "true") {
						aExpected.push(aExpected.shift()); // the first will be last
					} else if (sGrandTotalAtBottomOnly === "false") { // top and bottom
						aExpected.push(Object.assign({}, aExpected[0], {expanded : undefined}));
					}
					Then.onTheMainPage.checkTable(aExpected);
				}

				function toggleExpandInRow(iRow, sComment) {
					if (sGrandTotalAtBottomOnly === "true") {
						iRow -= 1;
					}
					When.onTheMainPage.toggleExpandInRow(iRow, sComment);
				}

				TestUtils.setData(
					"sap.ui.core.sample.odata.v4.DataAggregation.grandTotalAtBottomOnly",
					sGrandTotalAtBottomOnly);
				if (sGrandTotalAtBottomOnly === "false") {
					TestUtils.setData(
						"sap.ui.core.sample.odata.v4.DataAggregation.visibleRowCount", "6");
					When.onAnyPage.applySupportAssistant();
				}
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.DataAggregation"
					}
				});

				aInitialTableState = [{
					level : 0,
					expanded : true,
					country : "",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "79,443,315",
					localCurrency : "",
					salesNumber : "",
					subtotal : true
				}, {
					level : 1,
					expanded : false,
					country : "United Kingdom",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "14,548,502",
					localCurrency : "GBP",
					salesNumber : "",
					subtotal : true
				}, {
					level : 1,
					expanded : false,
					country : "USA",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "40,405,175",
					localCurrency : "USD",
					salesNumber : "",
					subtotal : true
				}, {
					level : 1,
					expanded : false,
					country : "Germany",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "24,489,638",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}];
				checkTable(aInitialTableState);

				toggleExpandInRow(3, "Expand Germany.");
				checkTable([{
					level : 0,
					expanded : true,
					country : "",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "79,443,315",
					localCurrency : "",
					salesNumber : "",
					subtotal : true
				}, {
					level : 1,
					expanded : false,
					country : "United Kingdom",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "14,548,502",
					localCurrency : "GBP",
					salesNumber : "",
					subtotal : true
				}, {
					level : 1,
					expanded : false,
					country : "USA",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "40,405,175",
					localCurrency : "USD",
					salesNumber : "",
					subtotal : true
				}, {
					level : 1,
					expanded : true,
					country : "Germany",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "24,489,638",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}, {
					level : 2,
					expanded : false,
					country : "Germany",
					region : "Saxony",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "1,161,590",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}]);

				When.onTheMainPage.scrollToRow(6, "Scroll to BW with paging.");
				checkTable([{
					level : 0,
					expanded : true,
					country : "",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "79,443,315",
					localCurrency : "",
					salesNumber : "",
					subtotal : true
				}, {
					level : 2,
					expanded : false,
					country : "Germany",
					region : "Hamburg",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "2,309,561",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}, {
					level : 2,
					expanded : false,
					country : "Germany",
					region : "Berlin",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "1,670,139",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}, {
					level : 2,
					expanded : false,
					country : "Germany",
					region : "Bavaria",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "5,857,115",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}, {
					level : 2,
					expanded : false,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "4,416,538",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}]);

				toggleExpandInRow(10, "Expand BW.");
				When.onTheMainPage.scrollToRow(9, "Scroll to BW.");
				checkTable([{
					level : 0,
					expanded : true,
					country : "",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "79,443,315",
					localCurrency : "",
					salesNumber : "",
					subtotal : true
				}, {
					level : 2,
					expanded : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "4,416,538",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}, {
					level : 3,
					expanded : false,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Large",
					accountResponsible : "",
					salesAmountLocalCurrency : "3,765,323",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}, {
					level : 3,
					expanded : false,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Mid-size",
					accountResponsible : "",
					salesAmountLocalCurrency : "526,122",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}, {
					level : 3,
					expanded : false,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Small",
					accountResponsible : "",
					salesAmountLocalCurrency : "125,093",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}]);

				toggleExpandInRow(13, "Expand BW-Small.");
				When.onTheMainPage.scrollToRow(11, "Scroll to BW-Small.");
				aAfterExpandBwSmall = [{
					level : 0,
					expanded : true,
					country : "",
					region : "",
					segment : "",
					accountResponsible : "",
					salesAmountLocalCurrency : "79,443,315",
					localCurrency : "",
					salesNumber : "",
					subtotal : true
				}, {
					level : 3,
					expanded : false,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Mid-size",
					accountResponsible : "",
					salesAmountLocalCurrency : "526,122",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}, {
					level : 3,
					expanded : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Small",
					accountResponsible : "",
					salesAmountLocalCurrency : "125,093",
					localCurrency : "EUR",
					salesNumber : "",
					subtotal : true
				}, {
					level : 4,
					expanded : undefined,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Small",
					accountResponsible : "Erwin Fischer",
					salesAmountLocalCurrency : "61,632",
					localCurrency : "EUR",
					salesNumber : "1,032",
					subtotal : false
				}, {
					level : 4,
					expanded : undefined,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Small",
					accountResponsible : "Winfried Maier",
					salesAmountLocalCurrency : "63,461",
					localCurrency : "EUR",
					salesNumber : "1,178",
					subtotal : false
				}];
				checkTable(aAfterExpandBwSmall);

				When.onTheMainPage.scrollToRow(0, "Scroll to top.");
				toggleExpandInRow(3, "Collapse Germany.");
				checkTable(aInitialTableState);

				toggleExpandInRow(3, "Expand Germany again.");
				When.onTheMainPage.scrollToRow(11, "Scroll to BW-Large.");
				checkTable(aAfterExpandBwSmall);

				Then.onAnyPage.checkLog();
				if (sGrandTotalAtBottomOnly === "false") {
					Then.onAnyPage.analyzeSupportAssistant();
				}
				Then.iTeardownMyUIComponent();
			});
		});

		QUnit.start();
	});
});
