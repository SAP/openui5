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
		TestUtils.setData("sap.ui.core.sample.odata.v4.DataAggregation.filter", "RegionText GT M");
		When.onAnyPage.applySupportAssistant();
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.DataAggregation"
			}
		});

		Then.onTheMainPage.checkTable([{
			level : 0,
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "29,709,155",
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
			salesAmountLocalCurrency : "2,507,155",
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
			salesAmountLocalCurrency : "26,040,410",
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
			salesAmountLocalCurrency : "1,161,590",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}]);

		When.onTheMainPage.toggleExpandInRow(3, "Expand Germany.");
		When.onTheMainPage.toggleExpandInRow(4, "Expand Saxony");
		When.onTheMainPage.scrollToRow(Infinity, "Scroll to Saxony/Small.");
		When.onTheMainPage.toggleExpandInRow(7, "Expand Saxony/Small.");
		When.onTheMainPage.scrollToRow(Infinity, "Scroll to Saxony/Small/Michael Meier.");
		Then.onTheMainPage.checkTable([{
			level : 0,
			expanded : true,
			country : "",
			region : "",
			segment : "",
			accountResponsible : "",
			salesAmountLocalCurrency : "29,709,155",
			localCurrency : "",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			expanded : false,
			country : "Germany",
			region : "Saxony",
			segment : "Large",
			accountResponsible : "",
			salesAmountLocalCurrency : "1,019,044",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			expanded : false,
			country : "Germany",
			region : "Saxony",
			segment : "Mid-size",
			accountResponsible : "",
			salesAmountLocalCurrency : "116,096",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 3,
			expanded : true,
			country : "Germany",
			region : "Saxony",
			segment : "Small",
			accountResponsible : "",
			salesAmountLocalCurrency : "26,450",
			localCurrency : "EUR",
			salesNumber : "",
			subtotal : true
		}, {
			level : 4,
			expanded : undefined,
			country : "Germany",
			region : "Saxony",
			segment : "Small",
			accountResponsible : "Michael Meier",
			salesAmountLocalCurrency : "26,450",
			localCurrency : "EUR",
			salesNumber : "500",
			subtotal : false
		}]);

		Then.onAnyPage.checkLog();
		Then.onAnyPage.analyzeSupportAssistant();
		Then.iTeardownMyUIComponent();
	};
});
