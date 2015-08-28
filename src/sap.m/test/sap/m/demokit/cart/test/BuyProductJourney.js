/*!
 * ${copyright}
 */
/*global opaTest:true, QUnit */

// Eslint thinks window.opaTest is unused
/*eslint-disable no-unused-vars */
sap.ui.define(['sap/ui/test/Opa5'], function (Opa5) {
	/*eslint-enable no-unused-vars */
	"use strict";

	return {
		start: function (startup, teardown) {

			opaTest("Should see the category list", function (Given, When, Then) {
				// Arrangements
				startup.call(this, Given);

				//Actions
				When.iLookAtTheScreen();

				// Assertions
				Then.iShouldSeeTheCategoryList().
					and.theCategoryListShouldHaveSomeEntries();
			});

			//We are still on the second category
			opaTest("Should see the product list", function (Given, When, Then) {
				// Actions
				When.iPressOnTheSecondCategory();

				// Assertions
				Then.iShouldBeTakenToTheSecondCategory().
					and.iShouldSeeTheProductList().
					and.theProductListShouldHaveSomeEntries();
			});

			opaTest("Should add a product to the cart", function (Given, When, Then) {
				// Actions
				When.iPressOnTheFirstProduct().and.
					iAddTheDisplayedProductToTheCart().and.iGoToTheCartPage();

				// Assertions
				Then.iShouldSeeTheProductInMyCart().
					and.theProceedButtonShouldBeEnabled();
			});

			opaTest("Should order the cart", function (Given, When, Then) {
				// Actions
				When.iPressOnTheProceedButton().and.
					iFillTheForm().and.
					iPressOrderNow().and.
					iGoToTheCartPage();

				// Assertions
				Then.iShouldSeeAnEmptyCart();
				teardown.call(this, Then);
			});
		}
	}

});

