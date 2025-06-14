/* global QUnit */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/test/opaQunit",
	"./pages/Home",
	"./pages/Category",
	"./pages/Welcome",
	"./pages/Product",
	"./pages/Cart"
], (Localization, opaTest) => {
	"use strict";

	const sDefaultLanguage = Localization.getLanguage();

	QUnit.module("Navigation Journey", {
		before() {
			Localization.setLanguage("en-US");
		},
		after() {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	opaTest("Should start the app and go to the speaker category view", (Given, When, Then) => {
		// Arrangements
		Given.iStartMyApp();
		// Actions
		When.onHome.iPressOnTheSpeakerCategory();
		// Assertions
		Then.onTheCategory.iShouldBeTakenToTheSpeakerCategory();
	});

	opaTest("Should see the product Blaster Extreme", (Given, When, Then) => {
		// Actions
		When.onTheCategory.iPressOnTheProductBlasterExtreme();
		// Assertions
		Then.onTheProduct.iShouldSeeTheBlasterExtremeDetailPage();
	});

	opaTest("Should navigate back to home", (Given, When, Then) => {
		// Actions
		When.onTheCategory.iPressTheBackButtonInCategory();
		// Assertions
		Then.onHome.iShouldSeeTheCategoryList();
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should navigate to cart", (Given, When, Then) => {
		// Actions
		When.onTheWelcomePage.iToggleTheCart();
		// Assertions
		Then.onTheCart.iShouldSeeTheCart();
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should navigate from welcome to product view", (Given, When, Then) => {
		// Actions
		When.onTheWelcomePage.iToggleTheCart();
		When.onTheWelcomePage.iPressOnTheProductSmartphoneAlphaTitle();
		// Assertions
		Then.onTheProduct.iShouldSeeTheSmartphoneAlphaDetailPage();
	});

	opaTest("Should navigate back to home", (Given, When, Then) => {
		// Actions
		When.onTheCategory.iPressTheBackButtonInCategory();
		// Assertions
		Then.onHome.iShouldSeeTheCategoryList();
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should navigate to product view via pressing product image", (Given, When, Then) => {
		// Actions
		When.onTheWelcomePage.iPressTheProductImage();
		// Assertions
		Then.onTheProduct.iShouldSeeTheProductPage();
		Then.onTheCategory.iShouldSeeSomeEntriesInTheProductList();
		// Cleanup
		Then.iTeardownMyApp();
	});
});
