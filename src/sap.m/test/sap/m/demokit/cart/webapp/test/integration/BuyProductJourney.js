/*!
 * ${copyright}
 */
/*
 global QUnit
 */
sap.ui.define([
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5'
], function (opaTest) {
	"use strict";

	QUnit.module("Buy Product Journey");

	opaTest("Should see the category list", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		//Actions
		When.iLookAtTheScreen();

		// Assertions
		Then.onHome.iShouldSeeTheCategoryList().
			and.theCategoryListShouldHaveSomeEntries();
	});

	//We are still on the second category
	opaTest("Should see the product list", function (Given, When, Then) {
		// Actions
		When.onHome.iPressOnTheSecondCategory();

		// Assertions
		Then.onTheCategory.iShouldBeTakenToTheSecondCategory().
			and.iShouldSeeTheProductList().
			and.theProductListShouldHaveSomeEntries();
	});

	opaTest("Should add a product to the cart", function (Given, When, Then) {
		// Actions
		When.onTheCategory.iPressOnTheFirstProduct();
		When.onTheProduct.iAddTheDisplayedProductToTheCart();
		When.onTheCategory.iGoToTheCartPage();

		// Assertions
		Then.onTheCart.iShouldSeeTheProductInMyCart().and.iTeardownMyApp();
	});

	opaTest("Should keep the cart when reloading", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		// Actions
		When.onHome.iPressOnTheSecondCategory();
		When.onTheCategory.iGoToTheCartPage();

		// Assertions
		Then.onTheCart.iShouldSeeTheProductInMyCart();
	});

	opaTest("Should order the cart", function (Given, When, Then) {

		// Actions
		When.onTheCart.iPressOnTheProceedButton().and.
			iFillTheForm().and.
			iPressOrderNow();
		When.onHome.iGoToTheCartPage();

		// Assertions
		Then.onTheCart.iShouldSeeAnEmptyCart().and.iTeardownMyApp();
	});
});
