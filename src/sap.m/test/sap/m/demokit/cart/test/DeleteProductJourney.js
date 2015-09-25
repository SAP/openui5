/*!
 * ${copyright}
 */
/*
 global QUnit
 */
sap.ui.define([
		'sap/ui/test/opaQunit',
		'sap/ui/test/Opa5',
		'sap/ui/demo/cart/test/pageobjects/Home',
		'sap/ui/demo/cart/test/pageobjects/Category',
		'sap/ui/demo/cart/test/pageobjects/Product',
		'sap/ui/demo/cart/test/pageobjects/Cart',
		'sap/ui/demo/cart/test/pageobjects/Dialog'
	], function (opaTest) {
		"use strict";

	return {
			start: function (startup, teardown) {

				QUnit.module("Delete Product Journey");

				opaTest("Should see the product list", function (Given, When, Then) {
					// Arrangements
					startup.call(this, Given);

					// Actions
					When.onHome.iPressOnTheSecondCategory();

					// Assertions
					Then.onTheCategory.
						and.iShouldBeTakenToTheSecondCategory().
						and.iShouldSeeTheProductList().
						and.theProductListShouldHaveSomeEntries();
				});

				opaTest("Should add a product to the cart and enable the edit button", function (Given, When, Then) {
					// Actions
					When.onTheCategory.iPressOnTheFirstProduct();
					When.onTheProduct.iAddTheDisplayedProductToTheCart();
					When.onTheCategory.iGoToTheCartPage();

					// Assertions
					Then.onTheCart.iShouldSeeTheProductInMyCart().
						and.theEditButtonShouldBeEnabled();
				});

				opaTest("Should see the delete button after pressing the edit button", function (Given, When, Then) {
					// Actions
					When.onTheCart.iPressOnTheEditButton();

					// Assertions
					Then.onTheCart.iShouldSeeTheDeleteButton();
				});

				opaTest("Should see the confirmation dialog", function (Given, When, Then) {
					// Actions
					When.onTheCart.iPressOnTheDeleteButton();

					// Assertions
					Then.onTheDialog.iShouldBeTakenToTheConfirmationDialog();
				});

				opaTest("Should cancel the delete process", function (Given, When, Then) {
					// Actions
					When.onTheDialog.iPressCancelOnTheConfirmationDialog();

					// Assertions
					Then.onTheCart.iShouldBeTakenToTheCart();
				});

				opaTest("Should delete the product from the cart", function (Given, When, Then) {
					// Actions
					When.onTheCart.iPressOnTheDeleteButton();
					When.onTheDialog.iPressDeleteButtonOnTheConfirmationDialog();

					// Assertions
					Then.onTheCart.iShouldNotSeeTheDeletedItemInTheCart();
				});

				opaTest("Should see the edit button", function (Given, When, Then) {
					// Actions
					When.onTheCart.iPressOnTheAcceptButton();

					// Assertions
					Then.onTheCart.theEditButtonShouldBeDisabled();
					teardown.call(this, Then);
				});

			}
		};

	}
);
