
/*global QUnit*/

sap.ui.define([
	"sap/ui/test/opaQunit",
	"./pages/App",
	"./pages/List",
	"./pages/Detail"
], function (opaTest) {
	"use strict";

	QUnit.module("Nested Component Navigation");

	opaTest("Should navigate back and forth", function (Given, When, Then) {
		Given.iStartMyApp();
		Then.onTheAppPage.iShouldSeeHash("");

		When.onTheAppPage.iSelectMenuItem("suppliersItem");
		Then.onTheAppPage.iShouldSeeHash("#/suppliers");

		When.onTheAppPage.iPressBrowserBack();
		Then.onTheAppPage.iShouldSeeHash("");

		When.onTheAppPage.iPressBrowserForward();
		Then.onTheAppPage.iShouldSeeHash("#/suppliers");

		When.onTheListPage.iPressListItem("suppliers", "CompanyName", "UI5 Amazing Manufactor SE");
		Then.onTheListPage.iShouldSeeHash("#/suppliers&/s/detail/2&/s-p/%252FSuppliers(2)");

		When.onTheAppPage.iPressBrowserBack();
		Then.onTheAppPage.iShouldSeeHash("#/suppliers");

		When.onTheAppPage.iPressBrowserForward();
		Then.onTheListPage.iShouldSeeHash("#/suppliers&/s/detail/2&/s-p/%252FSuppliers(2)");

		When.onTheListPage.iPressListItem("products", "ProductName", "UI5 Enamel Mug");
		Then.onTheListPage.iShouldSeeHash("#/products&/p/detail/10");

		When.onTheAppPage.iPressBrowserBack();
		Then.onTheAppPage.iShouldSeeHash("#/suppliers&/s/detail/2&/s-p/%252FSuppliers(2)");

		When.onTheAppPage.iPressBrowserForward();
		Then.onTheListPage.iShouldSeeHash("#/products&/p/detail/10");

		When.onTheDetailPage.iPressLink("products", "UI5 Amazing Manufactor SE");
		Then.onTheDetailPage.iShouldSeeHash("#/suppliers&/s/detail/2&/s-p/%252FSuppliers(2)");

		When.onTheAppPage.iPressBrowserBack();
		Then.onTheAppPage.iShouldSeeHash("#/products&/p/detail/10");

		When.onTheAppPage.iPressBrowserForward();
		Then.onTheDetailPage.iShouldSeeHash("#/suppliers&/s/detail/2&/s-p/%252FSuppliers(2)");

		Given.iTeardownMyApp();
	});

});