/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
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

		//*****************************************************************************
		var sTitle = "Start data aggregation app, expand to node level 4 with paging and collapse";
		opaTest(sTitle, function (Given, When, Then) {
			var aAfterExpandBwSmall, aInitialTableState;

			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.DataAggregation"
				}
			});

			aInitialTableState = [{
				level : 1,
				expanded : false,
				country : "United Kingdom",
				region : "",
				segment : "",
				accountResponsible : "",
				salesAmount : "16,165,258",
				salesNumber : "",
				subtotal : true
			}, {
				level : 1,
				expanded : false,
				country : "USA",
				region : "",
				segment : "",
				accountResponsible : "",
				salesAmount : "35,135,431",
				salesNumber : "",
				subtotal : true
			}, {
				level : 1,
				expanded : false,
				country : "Germany",
				region : "",
				segment : "",
				accountResponsible : "",
				salesAmount : "24,489,638",
				salesNumber : "",
				subtotal : true
			}];
			Then.onTheMainPage.checkTable(aInitialTableState);

			When.onTheMainPage.toggleExpandInRow(2, "Expand Germany.");
			Then.onTheMainPage.checkTable([{
				level : 1,
				expanded : false,
				country : "United Kingdom",
				region : "",
				segment : "",
				accountResponsible : "",
				salesAmount : "16,165,258",
				salesNumber : "",
				subtotal : true
			}, {
				level : 1,
				expanded : false,
				country : "USA",
				region : "",
				segment : "",
				accountResponsible : "",
				salesAmount : "35,135,431",
				salesNumber : "",
				subtotal : true
			}, {
				level : 1,
				expanded : true,
				country : "Germany",
				region : "",
				segment : "",
				accountResponsible : "",
				salesAmount : "24,489,638",
				salesNumber : "",
				subtotal : true
			}, {
				level : 2,
				expanded : false,
				country : "Germany",
				region : "Saxony",
				segment : "",
				accountResponsible : "",
				salesAmount : "1,161,590",
				salesNumber : "",
				subtotal : true
			}, {
				level : 2,
				expanded : false,
				country : "Germany",
				region : "Lower Saxony",
				segment : "",
				accountResponsible : "",
				salesAmount : "3,160,739",
				salesNumber : "",
				subtotal : true
			}]);

			When.onTheMainPage.scrollToRow(5, "Scroll to BW with paging.");
			Then.onTheMainPage.checkTable([{
				level : 2,
				expanded : false,
				country : "Germany",
				region : "Hessia",
				segment : "",
				accountResponsible : "",
				salesAmount : "5,913,956",
				salesNumber : "",
				subtotal : true
			}, {
				level : 2,
				expanded : false,
				country : "Germany",
				region : "Hamburg",
				segment : "",
				accountResponsible : "",
				salesAmount : "2,309,561",
				salesNumber : "",
				subtotal : true
			}, {
				level : 2,
				expanded : false,
				country : "Germany",
				region : "Berlin",
				segment : "",
				accountResponsible : "",
				salesAmount : "1,670,139",
				salesNumber : "",
				subtotal : true
			}, {
				level : 2,
				expanded : false,
				country : "Germany",
				region : "Bavaria",
				segment : "",
				accountResponsible : "",
				salesAmount : "5,857,115",
				salesNumber : "",
				subtotal : true
			}, {
				level : 2,
				expanded : false,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "",
				accountResponsible : "",
				salesAmount : "4,416,538",
				salesNumber : "",
				subtotal : true
			}]);

			When.onTheMainPage.toggleExpandInRow(9, "Expand BW.");
			When.onTheMainPage.scrollToRow(8, "Scroll to BW.");
			Then.onTheMainPage.checkTable([{
				level : 2,
				expanded : false,
				country : "Germany",
				region : "Bavaria",
				segment : "",
				accountResponsible : "",
				salesAmount : "5,857,115",
				salesNumber : "",
				subtotal : true
			}, {
				level : 2,
				expanded : true,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "",
				accountResponsible : "",
				salesAmount : "4,416,538",
				salesNumber : "",
				subtotal : true
			}, {
				level : 3,
				expanded : false,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "Large",
				accountResponsible : "",
				salesAmount : "3,765,323",
				salesNumber : "",
				subtotal : true
			}, {
				level : 3,
				expanded : false,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "Mid-size",
				accountResponsible : "",
				salesAmount : "526,122",
				salesNumber : "",
				subtotal : true
			}, {
				level : 3,
				expanded : false,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "Small",
				accountResponsible : "",
				salesAmount : "125,093",
				salesNumber : "",
				subtotal : true
			}]);

			When.onTheMainPage.toggleExpandInRow(12, "Expand BW-Small.");
			When.onTheMainPage.scrollToRow(10, "Scroll to BW-Small.");
			aAfterExpandBwSmall = [{
				level : 3,
				expanded : false,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "Large",
				accountResponsible : "",
				salesAmount : "3,765,323",
				salesNumber : "",
				subtotal : true
			}, {
				level : 3,
				expanded : false,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "Mid-size",
				accountResponsible : "",
				salesAmount : "526,122",
				salesNumber : "",
				subtotal : true
			}, {
				level : 3,
				expanded : true,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "Small",
				accountResponsible : "",
				salesAmount : "125,093",
				salesNumber : "",
				subtotal : true
			}, {
				level : 4,
				expanded : undefined,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "Small",
				accountResponsible : "Erwin Fischer",
				salesAmount : "61,632",
				salesNumber : "1,032",
				subtotal : false
			}, {
				level : 4,
				expanded : undefined,
				country : "Germany",
				region : "Baden-Württemberg",
				segment : "Small",
				accountResponsible : "Winfried Maier",
				salesAmount : "63,461",
				salesNumber : "1,178",
				subtotal : false
			}];
			Then.onTheMainPage.checkTable(aAfterExpandBwSmall);

			When.onTheMainPage.scrollToRow(0, "Scroll to United Kingdom.");
			When.onTheMainPage.toggleExpandInRow(2, "Collapse Germany.");
			Then.onTheMainPage.checkTable(aInitialTableState);

			When.onTheMainPage.toggleExpandInRow(2, "Expand Germany again.");
			When.onTheMainPage.scrollToRow(10, "Scroll to BW-Large.");
			Then.onTheMainPage.checkTable(aAfterExpandBwSmall);

			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
