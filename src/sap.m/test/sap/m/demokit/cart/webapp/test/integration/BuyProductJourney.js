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

	opaTest("Should navigate to checkout", function (Given, When, Then) {

		// Actions
		When.onTheCart.iPressOnTheProceedButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});

	opaTest("Should return to the cart", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheReturnToShopButton();

		Then.onTheCart.iShouldSeeTheProductInMyCart();
	});


	// Checkout with Credit Card
	opaTest("Should return to checkout", function (Given, When, Then) {

		// Actions
		When.onTheCart.iPressOnTheProceedButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});

	opaTest("Should navigate to Payment Step", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepPaymentTypeStep();
	});

	opaTest("Should navigate to Credit Card Step", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheCreditCardStep();
	});

	opaTest("Should activate Step 4 Button", function (Given, When, Then) {

		// Actions
		When.onCheckout.iEnterCreditCardText();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep4ButtonEnabled();
	});

	opaTest("Should navigate to Billing Step", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheBillingStep();
	});

	opaTest("Should activate Step 5 Button", function (Given, When, Then) {

		// Actions
		When.onCheckout.iEnterBillingAddressText();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep5ButtonValidated();
	});

	opaTest("Should navigate to Delivery Type Step", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryTypeStep();
	});

	opaTest("Should navigate to order summary", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary();
	});

	// Checkout with Bank Transfer
	opaTest("Should return to checkout", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheEditButtonBacktoList();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});

	opaTest("Should select Bank Transfer", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheBankTransferButton().and.iPressOnTheYesButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep3ButtonEnabled();
	});

	opaTest("Should navigate to Bank Transfer", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep4ButtonEnabled();
	});

	opaTest("Should navigate to Billing Address", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep5ButtonEnabled();
	});


		opaTest("Should navigate to Delivery Type Step", function (Given, When, Then) {

			// Actions
			When.onCheckout.iPressOnTheNextStepButton();

			// Assertions
			Then.onCheckout.iShouldSeeTheDeliveryTypeStep();
		});

	opaTest("Should navigate to order summary", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary();
	});

	// Checkout with Cash on Delivery
	opaTest("Should return to checkout", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheEditButtonBackToPaymentType();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});

	opaTest("Should select Cash On Delivery", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheCashOnDeliveryButton().and.iPressOnTheYesButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep3ButtonEnabled();
	});

	opaTest("Should navigate to Cash On Delivery", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheCashOnDeliveryStep();
	});

	opaTest("Should activate Step 4 Button", function (Given, When, Then) {

		// Actions
		When.onCheckout.iEnterCashOnDeliveryText();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep4ButtonEnabled();
	});

	opaTest("Should navigate to Billing Step", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheBillingStep();
	});


	opaTest("Should activate Step 5 Button", function (Given, When, Then) {

		// Actions
		When.onCheckout.iEnterBillingAddressText();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep5ButtonValidated();
	});

	opaTest("Should navigate to Delivery Type Step", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryTypeStep();
	});

	opaTest("Should navigate to order summary", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary();
	});

	opaTest("Should return to checkout", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheEditButtonBackToBillingAddress();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});
	// Checkout with Different Delivery Address

	opaTest("Should navigate to Delivery Address Step", function (Given, When, Then) {

		// Actions
		When.onCheckout.iCheckDifferentAddressText().and.iPressOnTheYesButton().and.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryAddressStep();
	});

	opaTest("Should activate Step 5 Button", function (Given, When, Then) {

		// Actions
		When.onCheckout.iEnterDeliveryAddressText();

		// Assertions
		Then.onCheckout.iShouldSeeTheStep6ButtonValidated();
	});

	opaTest("Should navigate to Delivery Type Step", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheDeliveryTypeStep();
	});

	opaTest("Should navigate to order summary", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary();
	});


	//Checkout with different Delivery Type
	opaTest("Should return to checkout", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheEditButtonBackToDeliveryType();

		// Assertions
		Then.onCheckout.iShouldSeeTheWizardStepContentsStep();
	});


	opaTest("Should select Express Delivery and navigate to order summary", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheExpressDeliveryButton().and.iPressOnTheNextStepButton();

		// Assertions
		Then.onCheckout.iShouldSeeTheOrderSummary().and.iShouldSeeExpressDelivery();
	});


	// submit order
	opaTest("Should submit order and navigate to order completed", function (Given, When, Then) {

		// Actions
		When.onCheckout.iPressOnTheSubmitButton().and.iPressOnTheYesButton();

		// Assertions
		Then.onOrderCompleted.iShouldSeeTheOrderCompletedPage();
	});

	opaTest("Should return to the shop welcome screen", function (Given, When, Then) {

		// Actions
		When.onOrderCompleted.iPressOnTheReturnToShopButton();

		// Assertions
		Then.onTheWelcomePage.iShouldSeeTheWelcomePage().and.iTeardownMyApp();
	});

});
