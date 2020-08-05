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
		opaTest("Start data aggregation app, expand to node level 4 with paging", function (Given, When, Then) {
			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.DataAggregation"
				}
			});

			Then.onTheMainPage.checkTable([{
					level : 1,
					expanded : false,
					subtotal : true,
					country : "United Kingdom",
					region : "",
					segment : "",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : false,
					subtotal : true,
					country : "USA",
					region : "",
					segment : "",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "",
					segment : "",
					accountResponsible : ""
				}]);

			When.onTheMainPage.pressExpandInRow(2,"Expand Germany.");
			Then.onTheMainPage.checkTable([{
					level : 1,
					expanded : false,
					subtotal : true,
					country : "United Kingdom",
					region : "",
					segment : "",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : false,
					subtotal : true,
					country : "USA",
					region : "",
					segment : "",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : true,
					subtotal : true,
					country : "Germany",
					region : "",
					segment : "",
					accountResponsible : ""
				}, {
					level : 2,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Saxony",
					segment : "",
					accountResponsible : ""
				}, {
					level : 2,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Lower Saxony",
					segment : "",
					accountResponsible : ""
				}]);

			When.onTheMainPage.scrollToRow(5, "Scroll to BW with paging.");
			Then.onTheMainPage.checkTable([{
					level : 2,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Hessia",
					segment : "",
					accountResponsible : ""
				}, {
					level : 2,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Hamburg",
					segment : "",
					accountResponsible : ""
				}, {
					level : 2,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Berlin",
					segment : "",
					accountResponsible : ""
				}, {
					level : 2,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Bavaria",
					segment : "",
					accountResponsible : ""
				}, {
					level : 2,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "",
					accountResponsible : ""
				}]);

			When.onTheMainPage.pressExpandInRow(9, "Expand BW.");
			When.onTheMainPage.scrollToRow(8, "Scroll to BW.");
			Then.onTheMainPage.checkTable([{
					level : 2,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Bavaria",
					segment : "",
					accountResponsible : ""
				}, {
					level : 2,
					expanded : true,
					subtotal : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "",
					accountResponsible : ""
				}, {
					level : 3,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Large",
					accountResponsible : ""
				}, {
					level : 3,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Mid-size",
					accountResponsible : ""
				}, {
					level : 3,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Small",
					accountResponsible : ""
				}]);

			When.onTheMainPage.pressExpandInRow(11, "Expand BW-Small.");
			When.onTheMainPage.scrollToRow(10, "Scroll to BW-Small.");
			Then.onTheMainPage.checkTable([{
					level : 3,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Large",
					accountResponsible : ""
				}, {
					level : 3,
					expanded : true,
					subtotal : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Mid-size",
					accountResponsible : ""
				}, {
					level : 4,
					expanded : undefined,
					subtotal : false,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Mid-size",
					accountResponsible : "Erwin Fischer"
				}, {
					level : 4,
					expanded : undefined,
					subtotal : false,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Mid-size",
					accountResponsible : "Winfried Maier"
				}, {
					level : 3,
					expanded : false,
					subtotal : true,
					country : "Germany",
					region : "Baden-Württemberg",
					segment : "Small",
					accountResponsible : ""
				}]);

			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
