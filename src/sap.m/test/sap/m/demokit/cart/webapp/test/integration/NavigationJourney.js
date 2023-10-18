/* global QUnit */

sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/test/opaQunit",
	"./pages/Home",
	"./pages/Category",
	"./pages/Welcome",
	"./pages/Product",
	"./pages/Cart"
], function (Configuration, opaTest) {
	"use strict";

	var sDefaultLanguage = Configuration.getLanguage();

	QUnit.module("Navigation Journey", {
		before : function () {
			Configuration.setLanguage("en-US");
		},
		after : function () {
			Configuration.setLanguage(sDefaultLanguage);
		}
	});

	opaTest("Should start the app and go to the speaker category view", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Actions
		When.onHome.iPressOnTheSpeakerCategory();
		// Assertions
		Then.onTheCategory.iShouldBeTakenToTheSpeakerCategory();
	});

	opaTest("Should see the product Blaster Extreme", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iPressOnTheProductBlasterExtreme();
		// Assertions
		Then.onTheProduct.iShouldSeeTheBlasterExtremeDetailPage();
	});

	opaTest("Should navigate back to home", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iPressTheBackButtonInCategory();
		// Assertions
		Then.onHome.iShouldSeeTheCategoryList();
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should navigate to cart", function (Given, When, Then) {
		// Actions
		When.onTheWelcomePage.iToggleTheCart();
		// Assertions
		Then.onTheCart.iShouldSeeTheCart();
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should navigate from welcome to product view", function (Given, When, Then) {
		// Actions
		When.onTheWelcomePage.iToggleTheCart();
		When.onTheWelcomePage.iPressOnTheProductSmartphoneAlphaTitle();
		// Assertions
		Then.onTheProduct.iShouldSeeTheSmartphoneAlphaDetailPage();
	});

	opaTest("Should navigate back to home", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iPressTheBackButtonInCategory();
		// Assertions
		Then.onHome.iShouldSeeTheCategoryList();
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage();
	});

	opaTest("Should navigate to product view via pressing product image", function (Given, When, Then) {
		// Actions
		When.onTheWelcomePage.iPressTheProductImage();
		// Assertions
		Then.onTheProduct.iShouldSeeTheProductPage();
		Then.onTheCategory.iShouldSeeSomeEntriesInTheProductList();
		// Cleanup
		Then.iTeardownMyApp();
	});
});
