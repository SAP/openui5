/*global QUnit*/

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/test/opaQunit",
	"./pages/Welcome",
	"./pages/Product",
	"./pages/Home",
	"./pages/Category"
], (Localization, opaTest) => {
	"use strict";

	const sDefaultLanguage = Localization.getLanguage();

	QUnit.module("Phone navigation", {
		before() {
			Localization.setLanguage("en-US");
		},
		after() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	opaTest("Should navigate to a product detail page by pressing the product link of the first product tile", (Given, When, Then) => {
		// Arrangements
		Given.iStartMyApp();
		//Actions
		When.onTheWelcomePage.iPressTheProductLink();
		// Assertions
		Then.onTheProduct.iShouldSeeTheProductPage();
	});

	opaTest("Should press back button and navigate to welcome view", (Given, When, Then) => {
		// Actions
		When.onTheProduct.iPressTheBackButtonInProduct();
		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("The category view should open by pressing the menu button", (Given, When, Then) => {
		//Actions
		When.onTheWelcomePage.iPressTheMenuButton();
		// Assertions
		Then.onHome.iShouldSeeTheCategoryList();
	});

	opaTest("Should see the product list", (Given, When, Then) => {
		// Actions
		When.onHome.iPressOnTheFlatScreensCategory();
		// Assertions
		Then.onTheCategory.iShouldBeTakenToTheFlatScreensCategory().
		and.iShouldSeeTheProductList().
		and.iShouldSeeSomeEntriesInTheProductList();
		// Cleanup
		Then.iTeardownMyApp();
	});
});
