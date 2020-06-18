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
		opaTest("Start data aggregation app, expand a subtotal node", function (Given, When, Then) {

			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.DataAggregation"
				}
			});

			// TODO $count

			Then.onTheMainPage.checkTable([{
					level : 1,
					expanded : false,
					subtotal : true,
					region : "West",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : false,
					subtotal : true,
					region : "Wales",
					accountResponsible : ""
			}]);

			// expand the first row
			When.onTheMainPage.pressExpandInRow(0);
			Then.onTheMainPage.checkTable([{
					level : 1,
					expanded : true,
					subtotal : true,
					region : "West",
					accountResponsible : ""
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "West",
					accountResponsible : "Alexander Fischer"
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "West",
					accountResponsible : "George Meier"
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "West",
					accountResponsible : "Jacky Woo"
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "West",
					accountResponsible : "Lindsey Wang"
			}]);

			// scroll 2 rows down
			When.onTheMainPage.scrollToRow(2);
			Then.onTheMainPage.checkTable([{
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "West",
					accountResponsible : "George Meier"
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "West",
					accountResponsible : "Jacky Woo"
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "West",
					accountResponsible : "Lindsey Wang"
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "West",
					accountResponsible : "Samantha Smith"
				}, {
					level : 1,
					expanded : false,
					subtotal : true,
					region : "Wales",
					accountResponsible : ""
			}]);

			// scroll to the end of the table
			When.onTheMainPage.scrollToRow(14);
			Then.onTheMainPage.checkTable([{
					level : 1,
					expanded : false,
					subtotal : true,
					region : "Greater Manchester",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : false,
					subtotal : true,
					region : "East",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : false,
					subtotal : true,
					region : "Berlin",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : false,
					subtotal : true,
					region : "Bavaria",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : false,
					subtotal : true,
					region : "Baden-Württemberg",
					accountResponsible : ""
			}]);

			// expand the second visible node
			When.onTheMainPage.pressExpandInRow(15);
			Then.onTheMainPage.checkTable([{
					level : 1,
					expanded : false,
					subtotal : true,
					region : "Greater Manchester",
					accountResponsible : ""
				}, {
					level : 1,
					expanded : true,
					subtotal : true,
					region : "East",
					accountResponsible : ""
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "East",
					accountResponsible : "Evelyn Kim"
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "East",
					accountResponsible : "LeeAn Smith"
				}, {
					level : 2,
					expanded : undefined,
					subtotal : false,
					region : "East",
					accountResponsible : "Miles David"
			}]);


			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
