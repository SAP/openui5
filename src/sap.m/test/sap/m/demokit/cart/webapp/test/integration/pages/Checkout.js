sap.ui.define([
	"sap/ui/test/Opa5",
	"./Common",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/matchers/I18NText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function (
	Opa5,
	Common,
	PropertyStrictEquals,
	I18NText,
	Press,
	EnterText) {
	"use strict";

	Opa5.createPageObjects({
		onCheckout: {
			baseClass: Common,
			viewName: "Checkout",
			actions: {

				iPressOnTheReturnToShopButton: function () {
					return this.waitFor({
						id: "returnToShopButton",
						actions: new Press()
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

				iPressOnDifferentAddressCheckbox: function () {
					return this.waitFor({
						id: "differentDeliveryAddress",
						actions: new Press(),
						errorMessage: "Could not press Different Delivery Address Checkbox"
					});
				},

				iPressOnTheButtonInTheFooter: function () {
					return this.waitFor({
						id: "showPopoverButton",
						actions: new Press(),
						errorMessage: "The button is not rendered and could not be pressed"
					});
				},

				iEnterCreditCardInformation: function (sHolderName, sNumber, sCode, sDate) {
					return this.waitFor({
						id: "creditCardHolderName",
						actions: new EnterText({text: sHolderName}),
						success: function () {
							this.waitFor({
								id: "creditCardNumber",
								actions: new EnterText({text: sNumber}),
								success: function () {
									this.waitFor({
										id: "creditCardSecurityNumber",
										actions: new EnterText({text: sCode}),
										success: function () {
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

				iEnterWrongCreditCardInformation: function () {
					this.iEnterCreditCardInformation("My name", "1234567891234567", "13", "01/2020");
				},

				iEnterCorrectCreditCardInformation: function () {
					this.iEnterCreditCardInformation("My name", "1234567891234567", "123", "01/2020");
				},

				iEnterCashOnDeliveryText: function (sFirstName, sLastName, sPhone, sEmail) {
					return this.waitFor({
						id: "cashOnDeliveryName",
						actions: new EnterText({text: sFirstName}),
						success: function () {
							this.waitFor({
								id: "cashOnDeliveryLastName",
								actions: new EnterText({text: sLastName}),
								success: function () {
									this.waitFor({
										id: "cashOnDeliveryPhoneNumber",
										actions: new EnterText({text: sPhone}),
										success: function () {
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

				iEnterCorrectCashOnDeliveryInfo: function () {
					this.iEnterCashOnDeliveryText("FirstName", "LastName", "+4911111111", "inf@shop.com");
				},

				iEnterInvoiceAddressText: function (sStreet, sCity, sZipCode, sCountry) {
					return this.waitFor({
						id: "invoiceAddressAddress",
						actions: new EnterText({text: sStreet}),
						success: function () {
							this.waitFor({
								id: "invoiceAddressCity",
								actions: new EnterText({text: sCity}),
								success: function () {
									this.waitFor({
										id: "invoiceAddressZip",
										actions: new EnterText({text: sZipCode}),
										success: function () {
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

				iEnterDeliveryAddressText: function () {
					return this.waitFor({
						id: "deliveryAddressAddress",
						actions: new EnterText({text: "MyStreet.2"}),
						success: function () {
							this.waitFor({
								id: "deliveryAddressCity",
								actions: new EnterText({text: "MyCity"}),
								success: function () {
									this.waitFor({
										id: "deliveryAddressZip",
										actions: new EnterText({text: "1234"}),
										success: function () {
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
				iEnterInvoiceAddress: function () {
					this.iEnterInvoiceAddressText("MyStreet.2", "MyCity", "1234", "DE");
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
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "MSGBOX_YES", "text", "sap.m");
						}.bind(this),
						success: function (aButtons) {
							return aButtons.filter(function () {
								return true;
							});
						},
						actions: new Press(),
						errorMessage: "Did not find the Yes button"
					});
					return this;
				},

				iPressOnTheEditButtonBacktoList : function () {
					return this.waitFor({
						id: "backtoList",
						actions : new Press(),
						errorMessage : "The BacktoList button could not be pressed"
					});
				},

				iPressOnTheEditButtonBackToPaymentType : function () {
					return this.waitFor({
						id: "backToInvoiceAddress",
						actions : new Press(),
						errorMessage : "The BackToInvoiceAddress button could not be pressed"
					});
				},

				iPressOnTheEditButtonBackToInvoiceAddress : function () {
					return this.waitFor({
						id: "backToPaymentType",
						actions : new Press(),
						errorMessage : "The BackToPaymentType button could not be pressed"
					});
				},

				iPressOnTheEditButtonBackToDeliveryType: function () {
					return this.waitFor({
						id: "backToDeliveryType",
						actions : new Press(),
						errorMessage : "The BackToDeliveryType button could not be pressed"
					});
				},


				iPressOnTheBankTransferButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new I18NText({ propertyName: "text", key: "checkoutPaymentBankTransfer"}),
						actions: new Press(),
						errorMessage: "Cannot select Bank Transfer from Payment Methods"
					});
				},

				iPressOnTheCashOnDeliveryButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new I18NText({ propertyName: "text", key: "checkoutPaymentCod"}),
						actions: new Press(),
						errorMessage: "Cannot select Cash On Delivery from Payment Methods"
					});
				},

				iPressOnTheExpressDeliveryButton : function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new I18NText({ propertyName: "text", key: "checkoutDeliveryTypeExpress"}),
						actions: new Press(),
						errorMessage: "Cannot select express delivery"
					});
				},

				iPressTheCloseButton: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
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

				iShouldSeeTheStep3Button: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: "Step 3"
						}),
						success: function (oStep) {
							Opa5.assert.ok(oStep[0].getProperty("visible"), "Found the Step3 Button enabled");
						}
					});
				},
				iShouldSeeTheStep4Button: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: "Step 4"
						}),
						success: function () {
							Opa5.assert.ok(true, "Found the Step4 Button enabled");
						}
					});
				},

				iShouldSeeTheStep5Button: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: "Step 5"
						}),
						success: function (oStep) {
							Opa5.assert.ok(oStep[0].getProperty("visible"), "Found the Step5 Button enabled");
						}
					});
				},

				iShouldSeeTheStep6Button: function () {
					return this.waitFor({
						controlType : "sap.m.Button",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: "Step 6"
						}),
						success: function (oStep) {
							Opa5.assert.ok(oStep[0].getProperty("visible"), "Found the Step6 Button enabled");
						},
						errorMessage: "Step6 buttom was not found"
					});
				},

				iShouldGetErrorMessageTextDoesNotMatchTypeForEmailField: function (sEmailFieldValue) {
					return this.waitFor({
						id: "cashOnDeliveryEmail",
						matchers: function(oControl){
							return this.I18NTextExtended(oControl, "checkoutCodEmailValueTypeMismatch", "valueStateText", null, [sEmailFieldValue]);
						}.bind(this),
						errorMessage: "The Email field error message text does not match to the type of error (value has wrong format)."
					});
				},

				iShouldNotSeeTheStep4Button: function (sStepId) {
					return this.waitFor({
						id: sStepId,
						success: function (oStep) {
							Opa5.assert.strictEqual(oStep.getValidated(), false, "The" + sStepId + " button was not found");
						},
						errorMessage: "The" + sStepId + " button was found"
					});
				},

				iShouldSeeTheDeliveryAddressStep: function () {
					return this.waitFor({
						id: "deliveryAddressStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep, "Found the WizardStep 'DeliveryStep'");
						}
					});
				},
				iShouldSeeTheDeliveryStepButton: function () {
					return this.waitFor({
						id: "deliveryAddressStep",
						success: function (oStep) {
							Opa5.assert.ok(oStep.getValidated(), "The delivery step button was found");
						},
						errorMessage: "The delivery step button was not found"
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
				},

				iShouldSeeTheFooterWithTheErrorButton: function() {
					return this.waitFor({
						id : "wizardFooterBar",
						success: function (oFooter) {
							Opa5.assert.ok(oFooter.getAggregation("contentLeft")[0].getProperty("text") === "1", "Found the Footer containing the error button");
						},
						errorMessage: "Footer is not visible"
					});
				},

				iShouldSeeTheMessagePopover: function() {
					return this.waitFor({
						id : "messagePopover",
						success : function () {
							Opa5.assert.ok("errorMessagePopover", "The MessagePopover is visible");
						},
						errorMessage: "The MessagePopover was not displayed"
					});
				}
			}
		}
	});
});
