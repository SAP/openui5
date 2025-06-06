sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/I18NText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], (Opa5, PropertyStrictEquals, I18NText, Press, EnterText) => {
	"use strict";

	Opa5.createPageObjects({
		onCheckout: {
			viewName: "Checkout",
			actions: {
				iPressOnTheReturnToShopButton() {
					return this.waitFor({
						id: "returnToShopButton",
						actions: new Press()
					});
				},

				iPressOnTheNextStepButton() {
					return this.waitFor({
						id: "shoppingCartWizard",
						actions(oWizard) {
							oWizard.nextStep();
						},
						errorMessage: "Could not proceed to Next Step"
					});
				},

				iPressOnDifferentAddressCheckbox() {
					return this.waitFor({
						id: "differentDeliveryAddress",
						actions: new Press(),
						errorMessage: "Could not press Different Delivery Address Checkbox"
					});
				},

				iPressOnTheButtonInTheFooter() {
					return this.waitFor({
						id: "showPopoverButton",
						actions: new Press(),
						errorMessage: "The button is not rendered and could not be pressed"
					});
				},

				iEnterCreditCardInformation(sHolderName, sNumber, sCode, sDate) {
					return this.waitFor({
						id: "creditCardHolderName",
						actions: new EnterText({text: sHolderName}),
						success() {
							this.waitFor({
								id: "creditCardNumber",
								actions: new EnterText({text: sNumber}),
								success() {
									this.waitFor({
										id: "creditCardSecurityNumber",
										actions: new EnterText({text: sCode}),
										success() {
											this.waitFor({
												id: "creditCardExpirationDate",
												actions: new EnterText({text: sDate}),
												errorMessage: "Could not enter Text on Input with id creditCardExpirationDate"
											});
										},
										errorMessage: "Could not enter Text on Input with id creditCardSecurityNumber"
									});
								},
								errorMessage: "Could not enter Text on Input with id creditCardNumber"
							});
						},
						errorMessage: "Could not enter Text on Input with id creditCardHolderName"
					});
				},

				iEnterWrongCreditCardInformation() {
					this.iEnterCreditCardInformation("My name", "1234567891234567", "13", "01/2020");
				},

				iEnterCorrectCreditCardInformation() {
					this.iEnterCreditCardInformation("My name", "1234567891234567", "123", "01/2020");
				},

				iEnterCashOnDeliveryText(sFirstName, sLastName, sPhone, sEmail) {
					return this.waitFor({
						id: "cashOnDeliveryName",
						actions: new EnterText({text: sFirstName}),
						success() {
							this.waitFor({
								id: "cashOnDeliveryLastName",
								actions: new EnterText({text: sLastName}),
								success() {
									this.waitFor({
										id: "cashOnDeliveryPhoneNumber",
										actions: new EnterText({text: sPhone}),
										success() {
											this.waitFor({
												id: "cashOnDeliveryEmail",
												actions: new EnterText({text: sEmail}),
												errorMessage: "Could not enter Text on Input with id 'cashOnDeliveryEmail'"
											});
										},
										errorMessage: "Could not enter Text on Input with id 'cashOnDeliveryPhoneNumber'"
									});
								},
								errorMessage: "Could not enter Text on Input with id 'cashOnDeliveryLastName'"
							});
						},
						errorMessage: "Could not enter Text 'cashOnDeliveryName'"
					});
				},

				iEnterCorrectCashOnDeliveryInfo() {
					this.iEnterCashOnDeliveryText("FirstName", "LastName", "+4911111111", "inf@shop.com");
				},

				iEnterInvoiceAddressText(sStreet, sCity, sZipCode, sCountry) {
					return this.waitFor({
						id: "invoiceAddressAddress",
						actions: new EnterText({text: sStreet}),
						success() {
							this.waitFor({
								id: "invoiceAddressCity",
								actions: new EnterText({text: sCity}),
								success() {
									this.waitFor({
										id: "invoiceAddressZip",
										actions: new EnterText({text: sZipCode}),
										success() {
											this.waitFor({
												id: "invoiceAddressCountry",
												actions: new EnterText({text: sCountry}),
												errorMessage: "Could not enter Text on Input with id invoiceAddressCountry"
											});
										},
										errorMessage: "Could not enter Text on Input with id invoiceAddressZip"
									});
								},
								errorMessage: "Could not enter Text on Input with id invoiceAddressCity"
							});
						},
						errorMessage: "Could not enter Text invoiceAddressAddress"
					});
				},

				iEnterDeliveryAddressText() {
					return this.waitFor({
						id: "deliveryAddressAddress",
						actions: new EnterText({text: "MyStreet.2"}),
						success() {
							this.waitFor({
								id: "deliveryAddressCity",
								actions: new EnterText({text: "MyCity"}),
								success() {
									this.waitFor({
										id: "deliveryAddressZip",
										actions: new EnterText({text: "1234"}),
										success() {
											this.waitFor({
												id: "deliveryAddressCountry",
												actions: new EnterText({text: "MyCountry"}),
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
				iEnterInvoiceAddress() {
					this.iEnterInvoiceAddressText("MyStreet.2", "MyCity", "1234", "DE");
				},

				iPressOnTheSubmitButton() {
					return this.waitFor({
						id: "submitOrder",
						actions: new Press(),
						errorMessage: "Could not submit order"
					});
				},

				iPressOnTheYesButton() {
					this.waitFor({
						searchOpenDialogs: true,
						controlType: "sap.m.Button",
						matchers: {
							properties: {
								text: "Yes"
							}
						},
						success(aButtons) {
							return aButtons.filter(() => true);
						},
						actions: new Press(),
						errorMessage: "Did not find the Yes button"
					});
					return this;
				},

				iPressOnTheEditButtonBacktoList() {
					return this.waitFor({
						id: "backtoList",
						actions: new Press(),
						errorMessage: "The BacktoList button could not be pressed"
					});
				},

				iPressOnTheEditButtonBackToPaymentType() {
					return this.waitFor({
						id: "backToInvoiceAddress",
						actions: new Press(),
						errorMessage: "The BackToInvoiceAddress button could not be pressed"
					});
				},

				iPressOnTheEditButtonBackToInvoiceAddress() {
					return this.waitFor({
						id: "backToPaymentType",
						actions: new Press(),
						errorMessage: "The BackToPaymentType button could not be pressed"
					});
				},

				iPressOnTheEditButtonBackToDeliveryType() {
					return this.waitFor({
						id: "backToDeliveryType",
						actions: new Press(),
						errorMessage: "The BackToDeliveryType button could not be pressed"
					});
				},


				iPressOnTheBankTransferButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new I18NText({propertyName: "text", key: "checkoutPaymentBankTransfer"}),
						actions: new Press(),
						errorMessage: "Cannot select Bank Transfer from Payment Methods"
					});
				},

				iPressOnTheCashOnDeliveryButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new I18NText({propertyName: "text", key: "checkoutPaymentCod"}),
						actions: new Press(),
						errorMessage: "Cannot select Cash On Delivery from Payment Methods"
					});
				},

				iPressOnTheExpressDeliveryButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new I18NText({propertyName: "text", key: "checkoutDeliveryTypeExpress"}),
						actions: new Press(),
						errorMessage: "Cannot select express delivery"
					});
				},

				iPressTheCloseButton() {
					return this.waitFor({
						controlType: "sap.m.Button",
						viewName: "",
						matchers: new PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://decline"
						}),
						actions: new Press(),
						errorMessage: "The message popover close button was not found"
					});
				}
			},
			assertions: {
				iShouldSeeTheWizardStepContentsStep() {
					return this.waitFor({
						id: "contentsStep",
						success(oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'contentsStep'");
						}
					});
				},
				iShouldSeeTheWizardStepPaymentTypeStep() {
					return this.waitFor({
						id: "paymentTypeStep",
						success(oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'PaymentTypeStep'");
						}
					});
				},

				iShouldSeeTheStep3Button() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: "Step 3"
						}),
						success(oStep) {
							Opa5.assert.ok(oStep[0].getProperty("visible"), "Found the Step3 Button enabled");
						}
					});
				},
				iShouldSeeTheStep4Button() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: "Step 4"
						}),
						success() {
							Opa5.assert.ok(true, "Found the Step4 Button enabled");
						}
					});
				},

				iShouldSeeTheStep5Button() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: "Step 5"
						}),
						success(oStep) {
							Opa5.assert.ok(oStep[0].getProperty("visible"), "Found the Step5 Button enabled");
						}
					});
				},

				iShouldSeeTheStep6Button() {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: "Step 6"
						}),
						success(oStep) {
							Opa5.assert.ok(oStep[0].getProperty("visible"), "Found the Step6 Button enabled");
						},
						errorMessage: "Step6 buttom was not found"
					});
				},

				iShouldGetErrorMessageTextDoesNotMatchTypeForEmailField(sEmailFieldValue) {
					return this.waitFor({
						id: "cashOnDeliveryEmail",
						matchers: {
							i18NText: {
								propertyName: "valueStateText",
								key: "checkoutCodEmailValueTypeMismatch",
								parameters: [sEmailFieldValue]
							}
						},
						errorMessage: "The Email field error message text does not match to the type of error (value has wrong format)."
					});
				},

				iShouldNotSeeTheStep4Button(sStepId) {
					return this.waitFor({
						id: sStepId,
						success(oStep) {
							Opa5.assert.strictEqual(oStep.getValidated(), false, "The" + sStepId + " button was not found");
						},
						errorMessage: "The" + sStepId + " button was found"
					});
				},

				iShouldSeeTheDeliveryAddressStep() {
					return this.waitFor({
						id: "deliveryAddressStep",
						success(oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'DeliveryStep'");
						}
					});
				},
				iShouldSeeTheDeliveryStepButton() {
					return this.waitFor({
						id: "deliveryAddressStep",
						success(oStep) {
							Opa5.assert.ok(oStep.getValidated(), "The delivery step button was found");
						},
						errorMessage: "The delivery step button was not found"
					});
				},

				iShouldSeeTheDeliveryTypeStep() {
					return this.waitFor({
						id: "deliveryTypeStep",
						success(oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'DeliveryTypeStep'");
						}
					});
				},

				iShouldSeeTheOrderSummary() {
					return this.waitFor({
						id: "summaryPage",
						success(oPage) {
							Opa5.assert.ok(oPage, "Found the order summary page");
						}
					});
				},

				iShouldSeeExpressDelivery() {
					return this.waitFor({
						id: "selectedDeliveryMethod",
						success() {
							Opa5.assert.ok("Express Delivery", "Found the Express Delivery Method");
						}
					});
				},

				iShouldSeeTheFooterWithTheErrorButton() {
					return this.waitFor({
						id: "wizardFooterBar",
						success(oFooter) {
							Opa5.assert.ok(oFooter.getAggregation("contentLeft")[0].getProperty("text") === "1", "Found the Footer containing the error button");
						},
						errorMessage: "Footer is not visible"
					});
				},

				iShouldSeeTheMessagePopover() {
					return this.waitFor({
						id: "messagePopover",
						success() {
							Opa5.assert.ok("errorMessagePopover", "The MessagePopover is visible");
						},
						errorMessage: "The MessagePopover was not displayed"
					});
				}
			}
		}
	});
});
