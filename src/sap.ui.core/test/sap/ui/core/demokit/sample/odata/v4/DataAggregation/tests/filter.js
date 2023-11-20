/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/DataAggregation/pages/Main",
	"sap/ui/test/TestUtils"
], function (_Any, _Main, TestUtils) {
	"use strict";

	return function (Given, When, Then) {
		var aInitialTableData = [{
				level : 0,
				groupLevelCount : "",
				expanded : true,
				country : "",
				region : "",
				segment : "",
				accountResponsible : "",
				salesAmountLocalCurrency : "29,709,155.00",
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
				salesAmountLocalCurrency : "26,040,410.00",
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
				salesAmountLocalCurrency : "2,507,155.00",
				localCurrency : "GBP",
				salesNumber : "",
				subtotal : true
			}, {
				level : 1,
				groupLevelCount : "",
				expanded : false,
				country : "Germany",
				region : "",
				segment : "",
				accountResponsible : "",
				salesAmountLocalCurrency : "1,161,590.00",
				localCurrency : "EUR",
				salesNumber : "",
				subtotal : true
			}];

		TestUtils.setData("sap.ui.core.sample.odata.v4.DataAggregation.filter", "Region GT M");
		When.onAnyPage.applySupportAssistant();
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.DataAggregation"
			}
		});
		Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

		Then.onTheMainPage.checkTable(aInitialTableData);

		When.onTheMainPage.toggleExpandInRow(3, "Expand Germany.");
		When.onTheMainPage.toggleExpandInRow(4, "Expand Saxony");
		When.onTheMainPage.scrollToRow(3, "Scroll to Saxony/Small.");
		When.onTheMainPage.toggleExpandInRow(7, "Expand Saxony/Small.");
		When.onTheMainPage.scrollToRow(4, "Scroll to Saxony/Small/Michael Meier.");
		Then.onTheMainPage.checkTable([{
			level : 0,
			groupLevelCount : "",
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "29,709,155.00",
			localCurrency : "",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			groupLevelCount : "",
			expanded : false,
			country : "Germany",
			region : "Saxony",
			segment : "Large",
			accountResponsible : "",
			salesAmountLocalCurrency : "1,019,044.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			groupLevelCount : "",
			expanded : false,
			country : "Germany",
			region : "Saxony",
			segment : "Mid-size",
			accountResponsible : "",
			salesAmountLocalCurrency : "116,096.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			groupLevelCount : "1",
			expanded : true,
			country : "Germany",
			region : "Saxony",
			segment : "Small",
			accountResponsible : "",
			salesAmountLocalCurrency : "26,450.00",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 4,
			groupLevelCount : "",
			expanded : undefined,
			country : "Germany",
			region : "Saxony",
			segment : "Small",
			accountResponsible : "Michael Meier",
			salesAmountLocalCurrency : "26,450.00",
			localCurrency : "EUR",
			salesNumber : "500",
			subtotal : false
		}]);

		When.onTheMainPage.enterSearch("Carol Johnson");
		When.onTheMainPage.toggleExpandInRow(1, "Expand United Kingdom.");
		When.onTheMainPage.toggleExpandInRow(2, "Expand Wales.");
		When.onTheMainPage.toggleExpandInRow(3, "Expand Large.");
		Then.onTheMainPage.checkTable([{
			level : 0,
			groupLevelCount : "",
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "815,825.00",
			localCurrency : "GBP",
			salesNumber : "",
			subtotal : true
		}, {
			level : 1,
			groupLevelCount : "1",
			expanded : true,
			country : "United Kingdom",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "815,825.00",
			localCurrency : "GBP",
			salesNumber : "",
			subtotal : true
		}, {
			level : 2,
			groupLevelCount : "3",
			expanded : true,
			country : "United Kingdom",
			region : "Wales",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "815,825.00",
			localCurrency : "GBP",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			groupLevelCount : "1",
			expanded : true,
			country : "United Kingdom",
			region : "Wales",
			segment : "Large",
			accountResponsible : "",
			salesAmountLocalCurrency : "716,262.00",
			localCurrency : "GBP",
			salesNumber : "",
			subtotal : true
		}, {
			level : 4,
			groupLevelCount : "",
			expanded : undefined,
			country : "United Kingdom",
			region : "Wales",
			segment : "Large",
			accountResponsible : "Carol Johnson",
			salesAmountLocalCurrency : "716,262.00",
			localCurrency : "GBP",
			salesNumber : "1,257",
			subtotal : false
		}]);

		When.onTheMainPage.enterSearch(""); // reset search value
		Then.onTheMainPage.checkTable(aInitialTableData);

		Then.onAnyPage.checkLog();
		Then.onAnyPage.analyzeSupportAssistant();
	};
});
