sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/BindingPath',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/matchers/AggregationFilled',
	'sap/ui/test/matchers/I18NText',
	'sap/ui/test/actions/Press',
	'sap/ui/test/actions/EnterText'
], function (Opa5, BindingPath, Properties, AggregationFilled, I18NText, Press, EnterText) {

	Opa5.createPageObjects({
		onCheckout: {
			viewName: "Checkout",
			actions: {

				iPressOnTheReturnToShopButton: function () {
					return this.waitFor({
						id: "returnToShopButton",
						actions: new sap.ui.test.actions.Press()
					});
				},

				iPressOnTheNextStepButton: function () {
					return this.waitFor({
						id: "shoppingCartWizard",
						actions: function (oWizard) {
							oWizard.nextStep();
						},
						errorMessage: "Could not proceed to Next Step"
					});
				},

				iCheckDifferentAddressText: function () {
					return this.waitFor({
						id: "differentDeliveryAddress",
						actions: new sap.ui.test.actions.Press(),
						errorMessage: "Could not check Different Delivery Address"
					});
				},


				iEnterCreditCardText: function () {
					return this.waitFor({
						id: "creditCardName",
						actions: new EnterText({text: "My Name"}),
						errorMessage: "Could not enter Text on Input with id CreditCardName"
					});
				},

				iEnterCashOnDeliveryText: function () {
					return this.waitFor({
						id: "cashOnDeliveryName",
						actions: new EnterText({text: "My Name"}),
						errorMessage: "Could not enter Text on Input with id CashOnDeliveryName"
					});
				},

				iEnterBillingAddressText: function () {
					return this.waitFor({
						id: "billingAddressAddress",
						actions: new EnterText({text: "My Name"}),
						success: function (oSelect) {
							this.waitFor({
								id: "billingAddressCity",
								actions: new EnterText({text: "My City"}),
								success: function (oSelect) {
									this.waitFor({
										id: "billingAddressZip",
										actions: new EnterText({text: "My Zip"}),
										success: function (oSelect) {
											this.waitFor({
												id: "billingAddressCountry",
												actions: new EnterText({text: "My Country"}),
												errorMessage: "Could not enter Text on Input with id BillingAddressCountry"
											});
										},
										errorMessage: "Could not enter Text on Input with id BillingAddressZip"
									});
								},
								errorMessage: "Could not enter Text on Input with id BillingAddressCity"
							});
						},
						errorMessage: "Could not enter Text BillingAddressAddress"
					});
				},

				iEnterDeliveryAddressText: function () {
					return this.waitFor({
						id: "deliveryAddressAddress",
						actions: new EnterText({text: "My Address2"}),
						success: function (oSelect) {
							this.waitFor({
								id: "deliveryAddressCity",
								actions: new EnterText({text: "My City2"}),
								success: function (oSelect) {
									this.waitFor({
										id: "deliveryAddressZip",
										actions: new EnterText({text: "My Zip2"}),
										success: function (oSelect) {
											this.waitFor({
												id: "deliveryAddressCountry",
												actions: new EnterText({text: "My Country2"}),
												errorMessage: "Could not enter Text on Input with id DeliveryAddressCountry"
											});
										},
										errorMessage: "Could not enter Text on Input with id DeliveryAddressZip"
									});
								},
								errorMessage: "Could not enter Text on Input with id DeliveryAddressCity"
							});
						},
						errorMessage: "Could not enter Text DeliveryAddressAddress"
					});
				},

				iPressOnTheSubmitButton: function () {
					return this.waitFor({
						id: "submitOrder",
						actions: new Press(),
						errorMessage: "Could not submit order"
					});
				},

				iPressOnTheYesButton: function () {
					this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Yes"
						}),
						success: function (aButtons) {
							return aButtons.filter(function () {
								return true;
							});
						},
						actions: new sap.ui.test.actions.Press(),
						errorMessage: "Did not find the Yes button"
					});
					return this;
				},

				iPressOnTheEditButtonBacktoList : function () {
					return this.waitFor({
						id: "backtoList",
						actions : new sap.ui.test.actions.Press(),
						errorMessage : "The BacktoList button could not be pressed"
					});
				},

				iPressOnTheEditButtonBackToPaymentType : function () {
					return this.waitFor({
						id: "backToBillingAddress",
						actions : new sap.ui.test.actions.Press(),
						errorMessage : "The BackToBillingAddress button could not be pressed"
					});
				},

				iPressOnTheEditButtonBackToBillingAddress : function () {
					return this.waitFor({
						id: "backToPaymentType",
						actions : new sap.ui.test.actions.Press(),
						errorMessage : "The BackToPaymentType button could not be pressed"
					});
				},

				iPressOnTheEditButtonBackToDeliveryType: function () {
					return this.waitFor({
						id: "backToDeliveryType",
						actions : new sap.ui.test.actions.Press(),
						errorMessage : "The BackToDeliveryType button could not be pressed"
					});
				},


				iPressOnTheBankTransferButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new sap.ui.test.matchers.I18NText({ propertyName: "text", key: "checkoutPaymentBanktransfer"}),
						actions: new sap.ui.test.actions.Press(),
						errorMessage: "Cannot select Bank Transfer from Payment Methods"
					});
				},

				iPressOnTheCashOnDeliveryButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new sap.ui.test.matchers.I18NText({ propertyName: "text", key: "checkoutPaymentCod"}),
						actions: new sap.ui.test.actions.Press(),
						errorMessage: "Cannot select Cash On Delivery from Payment Methods"
					});
				},

				iPressOnTheExpressDeliveryButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new sap.ui.test.matchers.I18NText({ propertyName: "text", key: "checkoutDeliverytypeExpress"}),
						actions: new sap.ui.test.actions.Press(),
						errorMessage: "Cannot select express delivery"
					});
				}


			},
			assertions: {
				iShouldSeeTheWizardStepContentsStep: function () {
					return this.waitFor({
						id: "contentsStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'contentsStep'");
						}
					});
				},
				iShouldSeeTheWizardStepPaymentTypeStep: function () {
					return this.waitFor({
						id: "paymentTypeStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'PaymentTypeStep'");
						}
					});
				},

				iShouldSeeTheCreditCardStep: function () {
					return this.waitFor({
						id: "creditCardStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'CreditCardStep'");
						}
					});
				},

				iShouldSeeTheCashOnDeliveryStep: function () {
					return this.waitFor({
						id: "cashOnDeliveryStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'CashOnDeliveryStep'");
						}
					});
				},


				iShouldSeeTheStep3ButtonEnabled: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Step 3"
						}),
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the Step3 Button enabled");
						}
					});
				},

				iShouldSeeTheStep4ButtonEnabled: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Step 4"
						}),
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the Step4 Button enabled");
						}
					});
				},

				iShouldSeeTheStep5ButtonEnabled: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new sap.ui.test.matchers.PropertyStrictEquals({
							name: "text",
							value: "Step 5"
						}),
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the Step5 Button enabled");
						}
					});
				},
				iShouldSeeTheBillingStep: function () {
					return this.waitFor({
						id: "billingStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'BillingStep'");
						}
					});
				},

				iShouldSeeTheDeliveryAddressStep: function () {
					return this.waitFor({
						id: "deliveryAddressStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep.getValidated(), "Found Step 5 Button");
						}
					});
				},

				iShouldSeeTheStep5ButtonValidated: function () {
					return this.waitFor({
						id: "billingStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep.getValidated(), "Found Step 5 Button");
						}
					});
				},

				iShouldSeeTheStep6ButtonValidated: function () {
					return this.waitFor({
						id: "deliveryAddressStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep.getValidated(), "Found Step 6 Button");
						}
					});
				},

				iShouldSeeTheDeliveryTypeStep: function () {
					return this.waitFor({
						id: "deliveryTypeStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'DeliveryTypeStep'");
						}
					});
				},

				iShouldSeeTheOrderSummary: function () {
					return this.waitFor({
						id: "summaryPage",
						success: function (oPage) {
							Opa5.assert.ok(oPage, "Found the order summary page");
						}
					});
				},

				iShouldSeeExpressDelivery: function () {
					return this.waitFor({
						id: "selectedDeliveryMethod",
						success: function () {
							Opa5.assert.ok("Express Delivery", "Found the Express Delivery Method");
						}
					});
				}


			}
		}
	});
});
