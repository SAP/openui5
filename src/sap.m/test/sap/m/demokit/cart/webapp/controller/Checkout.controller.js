sap.ui.define([
	"./BaseController",
	"../model/EmailType",
	"../model/formatter",
	"sap/m/Link",
	"sap/m/MessageBox",
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/ui/core/Messaging",
	"sap/ui/model/json/JSONModel"
], (BaseController, EmailType, formatter, Link, MessageBox, MessageItem, MessagePopover, Messaging,
		JSONModel) => {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Checkout", {
		types: {
			email: new EmailType()
		},

		formatter,

		onInit() {
			const oModel = new JSONModel({
				SelectedPayment: "Credit Card",
				SelectedDeliveryMethod: "Standard Delivery",
				DifferentDeliveryAddress: false,
				CashOnDelivery: {
					FirstName: "",
					LastName: "",
					PhoneNumber: "",
					Email: ""
				},
				InvoiceAddress: {
					Address: "",
					City: "",
					ZipCode: "",
					Country: "",
					Note: ""
				},
				DeliveryAddress: {
					Address: "",
					Country: "",
					City: "",
					ZipCode: "",
					Note: ""
				},
				CreditCard: {
					Name: "",
					CardNumber: "",
					SecurityCode: "",
					Expire: ""
				}
			});
			const oReturnToShopButton = this.byId("returnToShopButton");

			this.setModel(oModel);

			// previously selected entries in wizard
			this._oHistory = {
				prevPaymentSelect: null,
				prevDiffDeliverySelect: null
			};

			// Assign the model object to the SAPUI5 core
			this.setModel(Messaging.getMessageModel(), "message");

			// switch to single column view for checkout process
			this.getRouter().getRoute("checkout").attachMatched(() => {
				this._setLayout("One");
			});

			// set focus to the "Return to Shop" button each time the view is shown to avoid losing
			// the focus after changing the layout to one column
			this.getView().addEventDelegate({
				onAfterShow() {
					oReturnToShopButton.focus();
				}
			});
		},

		/**
		 * Only validation on client side, does not involve a back-end server.
		 * @param {sap.ui.base.Event} oEvent Press event of the button to display the MessagePopover
		 */
		onShowMessagePopoverPress(oEvent) {
			const oButton = oEvent.getSource();
			let oMessagePopover;
			const oLink = new Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

			/**
			 * Gather information that will be visible on the MessagePopover
			 */
			const oMessageTemplate = new MessageItem({
				type: '{message>type}',
				title: '{message>message}',
				subtitle: '{message>additionalText}',
				link: oLink
			});

			if (!this.byId("errorMessagePopover")) {
				oMessagePopover = new MessagePopover(this.createId("messagePopover"), {
					items: {
						path: 'message>/',
						template: oMessageTemplate
					},
					afterClose() {
						oMessagePopover.destroy();
					}
				});
				this._addDependent(oMessagePopover);
			}

			oMessagePopover.openBy(oButton);
		},

		//To be able to stub the addDependent function in unit test, we added it in a separate function
		_addDependent(oMessagePopover) {
			this.getView().addDependent(oMessagePopover);
		},

		/**
		 * Shows next WizardStep according to user selection
		 */
		goToPaymentStep() {
			const selectedKey = this.getModel().getProperty("/SelectedPayment");
			const oElement = this.byId("paymentTypeStep");
			switch (selectedKey) {
				case "Bank Transfer":
					oElement.setNextStep(this.byId("bankAccountStep"));
					break;
				case "Cash on Delivery":
					oElement.setNextStep(this.byId("cashOnDeliveryStep"));
					break;
				case "Credit Card":
				default:
					oElement.setNextStep(this.byId("creditCardStep"));
					break;
			}
		},

		/**
		 * Shows warning message if user changes previously selected payment method
		 */
		async setPaymentMethod() {
			this._setDiscardableProperty({
				message: (await this.requestResourceBundle()).getText("checkoutControllerChangePayment"),
				discardStep: this.byId("paymentTypeStep"),
				modelPath: "/SelectedPayment",
				historyPath: "prevPaymentSelect"
			});
		},

		/**
		 * Shows warning message if user changes previously selected delivery address
		 */
		async setDifferentDeliveryAddress() {
			this._setDiscardableProperty({
				message: (await this.requestResourceBundle()).getText("checkoutControllerChangeDelivery"),
				discardStep: this.byId("invoiceStep"),
				modelPath: "/DifferentDeliveryAddress",
				historyPath: "prevDiffDeliverySelect"
			});
		},

		/**
		 * Called from WizardStep "invoiceStep"
		 * shows next WizardStep "DeliveryAddressStep" or "DeliveryTypeStep" according to user selection
		 */
		invoiceAddressComplete() {
			const sNextStepId = (this.getModel().getProperty("/DifferentDeliveryAddress"))
				? "deliveryAddressStep"
				: "deliveryTypeStep";
			this.byId("invoiceStep").setNextStep(this.byId(sNextStepId));

		},

		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and cancels order if confirmed
		 */
		async handleWizardCancel() {
			const sText = (await this.requestResourceBundle()).getText("checkoutControllerAreYouSureCancel");
			this._handleSubmitOrCancel(sText, "warning", "home");
		},

		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and submits order if confirmed
		 */
		async handleWizardSubmit() {
			const sText = (await this.requestResourceBundle()).getText("checkoutControllerAreYouSureSubmit");
			this._handleSubmitOrCancel(sText, "confirm", "ordercompleted");
		},

		/**
		 * Called from <code>_handleSubmitOrCancel</code>
		 * resets Wizard after submitting or canceling order
		 */
		backToWizardContent() {
			this.byId("wizardNavContainer").backToPage(this.byId("wizardContentPage").getId());
		},

		/**
		 * Removes validation error messages from the previous step
		 */
		_clearMessages() {
			Messaging.removeAllMessages();
		},

		/**
		 * Checks the corresponding step after activation to decide whether the user can proceed or needs
		 * to correct the input
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onCheckStepActivation(oEvent) {
			this._clearMessages();
			const sWizardStepId = oEvent.getSource().getId();
			switch (sWizardStepId) {
				case this.createId("creditCardStep"):
					this.checkCreditCardStep();
					break;
				case this.createId("cashOnDeliveryStep"):
					this.checkCashOnDeliveryStep();
					break;
				case this.createId("invoiceStep"):
					this.checkInvoiceStep();
					break;
				case this.createId("deliveryAddressStep"):
					this.checkDeliveryAddressStep();
					break;
				default:
					break;
			}
		},

		/**
		 * Validates the credit card step initially and after each input
		 */
		checkCreditCardStep() {
			this._checkStep("creditCardStep", ["creditCardHolderName", "creditCardNumber", "creditCardSecurityNumber",
				"creditCardExpirationDate"]);
		},

		/**
		 * Validates the cash on delivery step initially and after each input
		 */
		checkCashOnDeliveryStep() {
			this._checkStep("cashOnDeliveryStep", ["cashOnDeliveryName", "cashOnDeliveryLastName",
				"cashOnDeliveryPhoneNumber", "cashOnDeliveryEmail"]);
		},

		/**
		 * Validates the invoice step initially and after each input
		*/
		checkInvoiceStep() {
			this._checkStep("invoiceStep", ["invoiceAddressAddress", "invoiceAddressCity", "invoiceAddressZip",
				"invoiceAddressCountry"]);
		},

		/**
		 * Validates the delivery address step initially and after each input
		 */
		checkDeliveryAddressStep() {
			this._checkStep("deliveryAddressStep", ["deliveryAddressAddress", "deliveryAddressCity",
				"deliveryAddressZip", "deliveryAddressCountry"]);
		},

		/**
		 * Checks if one or more of the inputs are empty.
		 * @param {array} aInputIds - Input ids to be checked
		 * @returns {boolean} Whether at least one input field contains invalid data
		 */
		_checkInputFields(aInputIds) {
			const oView = this.getView();

			return aInputIds.some((sInputId) => {
				const oInput = oView.byId(sInputId);
				const oBinding = oInput.getBinding("value");
				try {
					oBinding.getType().validateValue(oInput.getValue());
				} catch (oException) {
					return true;
				}

				return false;
			});
		},

		/**
		 * Hides button to proceed to next WizardStep if validation conditions are not fulfilled.
		 * @param {string} sStepName - the ID of the step to be checked
		 * @param {array} aInputIds - Input IDs to be checked
		 */
		_checkStep(sStepName, aInputIds) {
			const oWizard = this.byId("shoppingCartWizard");
			const oStep = this.byId(sStepName);
			const bEmptyInputs = this._checkInputFields(aInputIds);
			const bValidationError = !!Messaging.getMessageModel().getData().length;

			if (!bValidationError && !bEmptyInputs) {
				oWizard.validateStep(oStep);
			} else {
				oWizard.invalidateStep(oStep);
			}
		},

		/**
		 * Called from  Wizard on <code>complete</code>
		 * Navigates to the summary page in case there are no errors
		 */
		async checkCompleted() {
			if (Messaging.getMessageModel().getData().length > 0) {
				MessageBox.error((await this.requestResourceBundle()).getText("popOverMessageText"));
			} else {
				this.byId("wizardNavContainer").to(this.byId("summaryPage"));
			}
		},

		/**
		 * Navigates to "home" for further shopping
		 */
		onReturnToShopButtonPress() {
			this._setLayout("Two");
			this.getRouter().navTo("home");
		},

		// *** the following functions are private "helper" functions ***

		/**
		 * Called from both <code>setPaymentMethod</code> and <code>setDifferentDeliveryAddress</code> functions.
		 * Shows warning message if user changes previously selected choice.
		 * @param {Object} oParams Object containing message text, model path and WizardSteps
		 */
		_setDiscardableProperty(oParams) {
			const oWizard = this.byId("shoppingCartWizard");
			if (oWizard.getProgressStep() !== oParams.discardStep) {
				MessageBox.warning(oParams.message, {
					actions: [MessageBox.Action.YES,
						MessageBox.Action.NO],
					onClose: (oAction) => {
						if (oAction === MessageBox.Action.YES) {
							oWizard.discardProgress(oParams.discardStep);
							this._oHistory[oParams.historyPath] = this.getModel().getProperty(oParams.modelPath);
						} else {
							this.getModel().setProperty(oParams.modelPath, this._oHistory[oParams.historyPath]);
						}
					}
				});
			} else {
				this._oHistory[oParams.historyPath] = this.getModel().getProperty(oParams.modelPath);
			}
		},

		/**
		 * Called from <code>handleWizardCancel</code> and <code>handleWizardSubmit</code> functions.
		 * Shows warning message, resets shopping cart and wizard if confirmed and navigates to given route.
		 * @param {string} sMessage message text
		 * @param {string} sMessageBoxType message box type (e.g. warning)
		 * @param {string} sRoute route to navigate to
		 */
		_handleSubmitOrCancel(sMessage, sMessageBoxType, sRoute) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES,
					MessageBox.Action.NO],
				onClose: (oAction) => {
					if (oAction === MessageBox.Action.YES) {
						// resets Wizard
						const oWizard = this.byId("shoppingCartWizard");
						const oModel = this.getModel();
						const oCartModel = this.getOwnerComponent().getModel("cartProducts");
						this._navToWizardStep(this.byId("contentsStep"));
						oWizard.discardProgress(oWizard.getSteps()[0]);
						const oModelData = oModel.getData();
						oModelData.SelectedPayment = "Credit Card";
						oModelData.SelectedDeliveryMethod = "Standard Delivery";
						oModelData.DifferentDeliveryAddress = false;
						oModelData.CashOnDelivery = {};
						oModelData.InvoiceAddress = {};
						oModelData.DeliveryAddress = {};
						oModelData.CreditCard = {};
						oModel.setData(oModelData);
						//all relevant cart properties are set back to default. Content is deleted.
						const oCartModelData = oCartModel.getData();
						oCartModelData.cartEntries = {};
						oCartModelData.totalPrice = 0;
						oCartModel.setData(oCartModelData);
						this.getRouter().navTo(sRoute);
					}
				}
			});
		},

		/**
		 * Gets customData from ButtonEvent and navigates to the WizardStep.
		 * @param {sap.ui.base.Event} oEvent the press event of the button
		 */
		_navBackToStep(oEvent) {
			const sStep = oEvent.getSource().data("navBackTo");
			const oStep = this.byId(sStep);
			this._navToWizardStep(oStep);
		},

		/**
		 * Navigates to WizardStep.
		 * @param {Object} oStep WizardStep DOM element
		 */
		_navToWizardStep(oStep) {
			const oNavContainer = this.byId("wizardNavContainer");
			const _fnAfterNavigate = () => {
				this.byId("shoppingCartWizard").goToStep(oStep);
				// detaches itself after navigation
				oNavContainer.detachAfterNavigate(_fnAfterNavigate);
			};

			oNavContainer.attachAfterNavigate(_fnAfterNavigate);
			oNavContainer.to(this.byId("wizardContentPage"));
		}
	});
});
