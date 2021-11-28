sap.ui.define([
	"./BaseController",
	"../model/cart",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"../model/formatter",
	"sap/m/MessageBox",
	"sap/m/Link",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"../model/EmailType",
	"sap/ui/core/Core"
], function (
	BaseController,
	cart,
	JSONModel,
	Device,
	formatter,
	MessageBox,
	Link,
	MessagePopover,
	MessagePopoverItem,
	EmailType,
	oCore
) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Checkout", {

		types : {
			email: new EmailType()
		},

		formatter: formatter,

		onInit: function () {
			var oModel = new JSONModel(
				{
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
				}),
				oReturnToShopButton = this.byId("returnToShopButton");

			this.setModel(oModel);

			// previously selected entries in wizard
			this._oHistory = {
				prevPaymentSelect: null,
				prevDiffDeliverySelect: null
			};

			// Assign the model object to the SAPUI5 core
			this.setModel(oCore.getMessageManager().getMessageModel(), "message");

			// switch to single column view for checout process
			this.getRouter().getRoute("checkout").attachMatched(function () {
				this._setLayout("One");
			}.bind(this));

			// set focus to the "Return to Shop" button each time the view is shown to avoid losing
			// the focus after changing the layout to one column
			this.getView().addEventDelegate({
				onAfterShow : function () {
					oReturnToShopButton.focus();
				}
			});
		},

		/**
		 * Only validation on client side, does not involve a back-end server.
		 * @param {sap.ui.base.Event} oEvent Press event of the button to display the MessagePopover
		 */
		onShowMessagePopoverPress: function (oEvent) {
			var oButton = oEvent.getSource();

			var oLink = new Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

			/**
			 * Gather information that will be visible on the MessagePopover
			 */
			var oMessageTemplate = new MessagePopoverItem({
				type: '{message>type}',
				title: '{message>message}',
				subtitle: '{message>additionalText}',
				link: oLink
			});

			if (!this.byId("errorMessagePopover")) {
				var oMessagePopover = new MessagePopover(this.createId("messagePopover"), {
					items: {
						path: 'message>/',
						template: oMessageTemplate
					},
					afterClose: function () {
						oMessagePopover.destroy();
					}
				});
				this._addDependent(oMessagePopover);
			}

			oMessagePopover.openBy(oButton);
		},

		//To be able to stub the addDependent function in unit test, we added it in a separate function
		_addDependent: function (oMessagePopover) {
			this.getView().addDependent(oMessagePopover);
		},

		/**
		 * Shows next WizardStep according to user selection
		 */
		goToPaymentStep: function () {
			var selectedKey = this.getModel().getProperty("/SelectedPayment");
			var oElement = this.byId("paymentTypeStep");
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
		setPaymentMethod: function () {
			this._setDiscardableProperty({
				message: this.getResourceBundle().getText("checkoutControllerChangePayment"),
				discardStep: this.byId("paymentTypeStep"),
				modelPath: "/SelectedPayment",
				historyPath: "prevPaymentSelect"
			});
		},

		/**
		 * Shows warning message if user changes previously selected delivery address
		 */
		setDifferentDeliveryAddress: function () {
			this._setDiscardableProperty({
				message: this.getResourceBundle().getText("checkoutControllerChangeDelivery"),
				discardStep: this.byId("invoiceStep"),
				modelPath: "/DifferentDeliveryAddress",
				historyPath: "prevDiffDeliverySelect"
			});
		},

		/**
		 * Called from WizardStep "invoiceStep"
		 * shows next WizardStep "DeliveryAddressStep" or "DeliveryTypeStep" according to user selection
		 */
		invoiceAddressComplete: function () {
			var sNextStepId = (this.getModel().getProperty("/DifferentDeliveryAddress"))
				? "deliveryAddressStep"
				: "deliveryTypeStep";
			this.byId("invoiceStep").setNextStep(this.byId(sNextStepId));

		},

		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and cancels order if confirmed
		 */
		handleWizardCancel: function () {
			var sText = this.getResourceBundle().getText("checkoutControllerAreYouSureCancel");
			this._handleSubmitOrCancel(sText, "warning", "home");
		},

		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and submits order if confirmed
		 */
		handleWizardSubmit: function () {
			var sText = this.getResourceBundle().getText("checkoutControllerAreYouSureSubmit");
			this._handleSubmitOrCancel(sText, "confirm", "ordercompleted");
		},

		/**
		 * Called from <code>_handleSubmitOrCancel</code>
		 * resets Wizard after submitting or canceling order
		 */
		backToWizardContent: function () {
			this.byId("wizardNavContainer").backToPage(this.byId("wizardContentPage").getId());
		},

		/**
		 * Removes validation error messages from the previous step
		 */
		_clearMessages: function () {
			oCore.getMessageManager().removeAllMessages();
		},

		/**
		 * Checks the corresponding step after activation to decide whether the user can proceed or needs
		 * to correct the input
		 */
		onCheckStepActivation: function(oEvent) {
			this._clearMessages();
			var sWizardStepId = oEvent.getSource().getId();
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
			}
		},

		/**
		 * Validates the credit card step initially and after each input
		 */
		checkCreditCardStep: function () {
			this._checkStep("creditCardStep", ["creditCardHolderName", "creditCardNumber", "creditCardSecurityNumber", "creditCardExpirationDate"]);
		},

		/**
		 * Validates the cash on delivery step initially and after each input
		 */
		checkCashOnDeliveryStep: function () {
			this._checkStep("cashOnDeliveryStep", ["cashOnDeliveryName", "cashOnDeliveryLastName", "cashOnDeliveryPhoneNumber", "cashOnDeliveryEmail"]);
		},

		/**
		 * Validates the invoice step initially and after each input
		*/
		checkInvoiceStep: function () {
			this._checkStep("invoiceStep", ["invoiceAddressAddress", "invoiceAddressCity", "invoiceAddressZip", "invoiceAddressCountry"]);
		},

		/**
		 * Validates the delivery address step initially and after each input
		 */
		checkDeliveryAddressStep: function () {
			this._checkStep("deliveryAddressStep", ["deliveryAddressAddress", "deliveryAddressCity", "deliveryAddressZip", "deliveryAddressCountry"]);
		},

		/**
		 * Checks if one or more of the inputs are empty
		 * @param {array} aInputIds - Input ids to be checked
		 * @returns {boolean}
		 * @private
		 */
		_checkInputFields : function (aInputIds) {
			var oView = this.getView();

			return aInputIds.some(function (sInputId) {
				var oInput = oView.byId(sInputId);
				var oBinding = oInput.getBinding("value");
				try {
					oBinding.getType().validateValue(oInput.getValue());
				} catch (oException) {
					return true;
				}
				return false;
			});
		},

		/**
		 * Hides button to proceed to next WizardStep if validation conditions are not fulfilled
		 * @param {string} sStepName - the ID of the step to be checked
		 * @param {array} aInputIds - Input IDs to be checked
		 * @private
		 */
		_checkStep: function (sStepName, aInputIds) {
			var oWizard = this.byId("shoppingCartWizard"),
				oStep = this.byId(sStepName),
				bEmptyInputs = this._checkInputFields(aInputIds),
				bValidationError = !!oCore.getMessageManager().getMessageModel().getData().length;

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
		checkCompleted: function () {
			if (oCore.getMessageManager().getMessageModel().getData().length > 0) {
				MessageBox.error(this.getResourceBundle().getText("popOverMessageText"));
			} else {
				this.byId("wizardNavContainer").to(this.byId("summaryPage"));
			}
		},

		/**
		 * navigates to "home" for further shopping
		 */
		onReturnToShopButtonPress: function () {
			this._setLayout("Two");
			this.getRouter().navTo("home");
		},

		// *** the following functions are private "helper" functions ***

		/**
		 * Called from both <code>setPaymentMethod</code> and <code>setDifferentDeliveryAddress</code> functions.
		 * Shows warning message if user changes previously selected choice
		 * @private
		 * @param {Object} oParams Object containing message text, model path and WizardSteps
		 */
		_setDiscardableProperty: function (oParams) {
			var oWizard = this.byId("shoppingCartWizard");
			if (oWizard.getProgressStep() !== oParams.discardStep) {
				MessageBox.warning(oParams.message, {
					actions: [MessageBox.Action.YES,
						MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.YES) {
							oWizard.discardProgress(oParams.discardStep);
							this._oHistory[oParams.historyPath] = this.getModel().getProperty(oParams.modelPath);
						} else {
							this.getModel().setProperty(oParams.modelPath, this._oHistory[oParams.historyPath]);
						}
					}.bind(this)
				});
			} else {
				this._oHistory[oParams.historyPath] = this.getModel().getProperty(oParams.modelPath);
			}
		},

		/**
		 * Called from <code>handleWizardCancel</code> and <code>handleWizardSubmit</code> functions.
		 * Shows warning message, resets shopping cart and wizard if confirmed and navigates to given route
		 * @private
		 * @param {string} sMessage message text
		 * @param {string} sMessageBoxType message box type (e.g. warning)
		 * @param {string} sRoute route to navigate to
		 */
		_handleSubmitOrCancel: function (sMessage, sMessageBoxType, sRoute) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES,
					MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						// resets Wizard
						var oWizard = this.byId("shoppingCartWizard");
						var oModel = this.getModel();
						var oCartModel = this.getOwnerComponent().getModel("cartProducts");
						this._navToWizardStep(this.byId("contentsStep"));
						oWizard.discardProgress(oWizard.getSteps()[0]);
						var oModelData = oModel.getData();
						oModelData.SelectedPayment = "Credit Card";
						oModelData.SelectedDeliveryMethod = "Standard Delivery";
						oModelData.DifferentDeliveryAddress = false;
						oModelData.CashOnDelivery = {};
						oModelData.InvoiceAddress = {};
						oModelData.DeliveryAddress = {};
						oModelData.CreditCard = {};
						oModel.setData(oModelData);
						//all relevant cart properties are set back to default. Content is deleted.
						var oCartModelData = oCartModel.getData();
						oCartModelData.cartEntries = {};
						oCartModelData.totalPrice = 0;
						oCartModel.setData(oCartModelData);
						this.getRouter().navTo(sRoute);
					}
				}.bind(this)
			});
		},

		/**
		 * gets customData from ButtonEvent
		 * and navigates to WizardStep
		 * @private
		 * @param {sap.ui.base.Event} oEvent the press event of the button
		 */
		_navBackToStep: function (oEvent) {
			var sStep = oEvent.getSource().data("navBackTo");
			var oStep = this.byId(sStep);
			this._navToWizardStep(oStep);
		},

		/**
		 * navigates to WizardStep
		 * @private
		 * @param {Object} oStep WizardStep DOM element
		 */
		_navToWizardStep: function (oStep) {
			var oNavContainer = this.byId("wizardNavContainer");
			var _fnAfterNavigate = function () {
				this.byId("shoppingCartWizard").goToStep(oStep);
				// detaches itself after navigaton
				oNavContainer.detachAfterNavigate(_fnAfterNavigate);
			}.bind(this);

			oNavContainer.attachAfterNavigate(_fnAfterNavigate);
			oNavContainer.to(this.byId("wizardContentPage"));
		}
	});
});
