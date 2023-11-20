/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/DataAggregation/pages/Main",
	"sap/ui/test/TestUtils"
], function (_Any, _Main, TestUtils) {
	"use strict";

	return function (sGrandTotalAtBottomOnly, sSubtotalsAtBottomOnly, sLeafCount, Given, When,
			Then) {
		var aAfterExpandBwSmall,
			oBw = {
				level : 2,
				groupLevelCount : "",
				expanded : false,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "",
				accountResponsible : "",
				salesAmountLocalCurrency : "4,416,538.00",
				localCurrency : "EUR",
				salesNumber : "",
				subtotal : true
			},
			oBwSmall = {
				level : 3,
				groupLevelCount : "",
				expanded : false,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "Small",
				accountResponsible : "",
				salesAmountLocalCurrency : "125,093.00",
				localCurrency : "EUR",
				salesNumber : "",
				subtotal : true
			},
			oGermany = {
				level : 1,
				groupLevelCount : "",
				expanded : false,
				country : "Germany",
				region : "",
				segment : "",
				accountResponsible : "",
				salesAmountLocalCurrency : "24,489,638.00",
				localCurrency : "EUR",
				salesNumber : "",
				subtotal : true
			},
			aInitialTableState;

		function checkSubtotalsAtBottom(iRow, oExpected, bNoNeedToScrollBack) {
			if (sSubtotalsAtBottomOnly) {
				When.onTheMainPage.scrollToRow(iRow - 4,
					"Scroll subtotals row into view.");
				Then.onTheMainPage.checkRow(Object.assign({}, oExpected, {
					expanded : undefined,
					country : "",
					region : "",
					segment : ""
				}), sGrandTotalAtBottomOnly === "true" ? 3 : 4);
				if (!bNoNeedToScrollBack) {
					When.onTheMainPage.scrollToRow(iRow - 5, "Scroll back.");
				}
			}
		}

		function checkTable(aExpected) {
			aExpected = aExpected.slice(); // shallow copy
			if (sGrandTotalAtBottomOnly === "true") {
				aExpected.push(aExpected.shift()); // the first will be last
			} else if (sGrandTotalAtBottomOnly === "false") { // top and bottom
				aExpected.push(Object.assign({}, aExpected[0], {expanded : undefined}));
			}
			if (sSubtotalsAtBottomOnly === "true") {
				aExpected.forEach(function (oExpected) {
					if (oExpected.expanded && oExpected.level) {
						// subtotals not shown here
						oExpected.salesAmountLocalCurrency = "";
						oExpected.localCurrency = "";
					}
				});
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
		}
		TestUtils.setData(
			"sap.ui.core.sample.odata.v4.DataAggregation.subtotalsAtBottomOnly",
			sSubtotalsAtBottomOnly);
		TestUtils.setData("sap.ui.core.sample.odata.v4.DataAggregation.leafCount", sLeafCount);
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.DataAggregation"
			}
		});
		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		aInitialTableState = [{
			level : 0,
			groupLevelCount : "",
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "79,443,315.00",
			localCurrency : "",
			salesNumber : "",
			subtotal : true
		}, {
			level : 1,
			groupLevelCount : "",
			expanded : false,
			country : "USA",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "40,405,175.00",
			localCurrency : "USD",
			salesNumber : "",
			subtotal : true
		}, {
			level : 1,
			groupLevelCount : "",
			expanded : false,
			country : "United Kingdom",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "14,548,502.00",
			localCurrency : "GBP",
			salesNumber : "",
			subtotal : true
		}, oGermany];
		checkTable(aInitialTableState);
		if (sLeafCount === "true") {
			Then.onTheMainPage.checkTitle("Sales Amount by Account Responsible (90)");
		}

		toggleExpandInRow(3, "Expand Germany.");
		checkTable([{
			level : 0,
			groupLevelCount : "",
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "79,443,315.00",
			localCurrency : "",
			salesNumber : "",
			subtotal : true
		}, {
			level : 1,
			groupLevelCount : "",
			expanded : false,
			country : "USA",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "40,405,175.00",
			localCurrency : "USD",
			salesNumber : "",
			subtotal : true
		}, {
			level : 1,
			groupLevelCount : "",
			expanded : false,
			country : "United Kingdom",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "14,548,502.00",
			localCurrency : "GBP",
			salesNumber : "",
			subtotal : true
		}, {
			level : 1,
			groupLevelCount : "7",
			expanded : true,
			country : "Germany",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "24,489,638.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 2,
			groupLevelCount : "",
			expanded : false,
			country : "Germany",
			region : "Saxony",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "1,161,590.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}]);

		When.onTheMainPage.scrollToRow(6, "Scroll to B.-W.");
		checkTable([{
			level : 0,
			groupLevelCount : "",
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "79,443,315.00",
			localCurrency : "",
			salesNumber : "",
			subtotal : true
		}, {
			level : 2,
			groupLevelCount : "",
			expanded : false,
			country : "Germany",
			region : "Hamburg",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "2,309,561.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 2,
			groupLevelCount : "",
			expanded : false,
			country : "Germany",
			region : "Berlin",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "1,670,139.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 2,
			groupLevelCount : "",
			expanded : false,
			country : "Germany",
			region : "Bavaria",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "5,857,115.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, oBw]);
		checkSubtotalsAtBottom(11, oGermany);

		toggleExpandInRow(10, "Expand B.-W.");
		When.onTheMainPage.scrollToRow(9, "Scroll to B.-W./Small.");
		checkTable([{
			level : 0,
			groupLevelCount : "",
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "79,443,315.00",
			localCurrency : "",
			salesNumber : "",
			subtotal : true
		}, {
			level : 2,
			groupLevelCount : "3",
			expanded : true,
			country : "Germany",
			region : "Baden-Württemberg",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "4,416,538.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			groupLevelCount : "",
			expanded : false,
			country : "Germany",
			region : "Baden-Württemberg",
			segment : "Large",
			accountResponsible : "",
			salesAmountLocalCurrency : "3,765,323.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			groupLevelCount : "",
			expanded : false,
			country : "Germany",
			region : "Baden-Württemberg",
			segment : "Mid-size",
			accountResponsible : "",
			salesAmountLocalCurrency : "526,122.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, oBwSmall]);
		checkSubtotalsAtBottom(14, oBw);

		toggleExpandInRow(13, "Expand B.-W./Small.");
		When.onTheMainPage.scrollToRow(11, "Scroll to B.-W./Small/Winfried Maier.");
		aAfterExpandBwSmall = [{
			level : 0,
			groupLevelCount : "",
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "79,443,315.00",
			localCurrency : "",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			groupLevelCount : "",
			expanded : false,
			country : "Germany",
			region : "Baden-Württemberg",
			segment : "Mid-size",
			accountResponsible : "",
			salesAmountLocalCurrency : "526,122.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			groupLevelCount : "2",
			expanded : true,
			country : "Germany",
			region : "Baden-Württemberg",
			segment : "Small",
			accountResponsible : "",
			salesAmountLocalCurrency : "125,093.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 4,
			groupLevelCount : "",
			expanded : undefined,
			country : "Germany",
			region : "Baden-Württemberg",
			segment : "Small",
			accountResponsible : "Erwin Fischer",
			salesAmountLocalCurrency : "61,632.00",
			localCurrency : "EUR",
			salesNumber : "1,032",
			subtotal : false
		}, {
			level : 4,
			groupLevelCount : "",
			expanded : undefined,
			country : "Germany",
			region : "Baden-Württemberg",
			segment : "Small",
			accountResponsible : "Winfried Maier",
			salesAmountLocalCurrency : "63,461.00",
			localCurrency : "EUR",
			salesNumber : "1,178",
			subtotal : false
		}];
		checkTable(aAfterExpandBwSmall);
		checkSubtotalsAtBottom(16, oBwSmall, true);
		if (sLeafCount === "true") {
			Then.onTheMainPage.checkTitle("Sales Amount by Account Responsible (90)");
		}

		When.onTheMainPage.scrollToRow(0, "Scroll to top.");
		toggleExpandInRow(3, "Collapse Germany.");
		checkTable([{
			level : 0,
			groupLevelCount : "",
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "79,443,315.00",
			localCurrency : "",
			salesNumber : "",
			subtotal : true
		}, {
			level : 1,
			groupLevelCount : "",
			expanded : false,
			country : "USA",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "40,405,175.00",
			localCurrency : "USD",
			salesNumber : "",
			subtotal : true
		}, {
			level : 1,
			groupLevelCount : "",
			expanded : false,
			country : "United Kingdom",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "14,548,502.00",
			localCurrency : "GBP",
			salesNumber : "",
			subtotal : true
		}, {
			level : 1,
			groupLevelCount : "7",
			expanded : false,
			country : "Germany",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "24,489,638.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}]);

		toggleExpandInRow(3, "Expand Germany again.");
		When.onTheMainPage.scrollToRow(11, "Scroll to B.-W./Small/Winfried Maier.");
		checkTable(aAfterExpandBwSmall);
		checkSubtotalsAtBottom(16, oBwSmall, true);

		Then.onAnyPage.checkLog();
	};
});
