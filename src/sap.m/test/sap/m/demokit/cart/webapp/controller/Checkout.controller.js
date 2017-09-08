sap.ui.define([
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/demo/cart/model/cart',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/demo/cart/model/formatter',
	'sap/m/MessageBox'
], function (BaseController, cart, JSONModel, Device, formatter, MessageBox) {
	"use strict";

	var _oHistory = {
		prevPaymentSelect: null,
		prevDiffDeliverySelect: null
	};

	return BaseController.extend("sap.ui.demo.cart.controller.Checkout", {
		formatter: formatter,

		onInit: function () {
			var oModel = new sap.ui.model.json.JSONModel(
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
				}
			);
			this.getView().setModel(oModel);
		},

		/**
		 * Checks the corresponding step after activation to decide whether the user can proceed or needs
		 * to correct his input
		 */
		onCheckStepActivation: function(oEvent) {
			var sWizardStepId = oEvent.getSource().getId();

			if (sWizardStepId === this.createId("creditCardStep")) {
				this.checkCreditCardStep();
			} else if (sWizardStepId === this.createId("cashOnDeliveryStep")) {
				this.checkCashOnDeliveryStep();
			} else if (sWizardStepId === this.createId("invoiceStep")) {
				this.checkInvoiceStep();
			} else if (sWizardStepId === this.createId("deliveryAddressStep")) {
				this.checkDeliveryStep();
			}
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
		 * Shows warning message if user changes prior selected payment method
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
		 * Shows warning message if user changes prior selected delivery address
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
		 * shows warning message and cancels order if affirmed
		 */
		handleWizardCancel: function () {
			var sText = this.getResourceBundle().getText("checkoutControllerConfirmCancel");
			this._handleSubmitOrCancel(sText, "warning", "home");
		},

		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and submits order if affirmed
		 */
		handleWizardSubmit: function () {
			var sText = this.getResourceBundle().getText("checkoutControllerConfirmSubmit");
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
		 * Called from  WizardStep "CreditCardStep" on <code>activate</code> or <code>liveChange</code>
		 * Hiddes button to next WizardStep if validation conditions are not fulfilled
		 */
		checkCreditCardStep: function () {
			var sCardName = this.getModel().getProperty("/CreditCard/Name") || "";
			var oElement = this.byId("creditCardStep");
			var oWizard = this.byId("shoppingCartWizard");
			if (sCardName.length < 2) {
				oWizard.invalidateStep(oElement);
			} else {
				oWizard.validateStep(oElement);
			}
		},

		/**
		 * Called from  WizardStep "CashOnDeliveryStep" on <code>activate</code> or <code>liveChange</code>
		 * Hiddes button to next WizardStep if validation conditions are not fulfilled
		 */
		checkCashOnDeliveryStep: function () {
			var sFirstName = this.getModel().getProperty("/CashOnDelivery/FirstName") || "";
			var oElement = this.byId("cashOnDeliveryStep");
			var oWizard = this.byId("shoppingCartWizard");
			if (sFirstName.length < 2) {
				oWizard.invalidateStep(oElement);
			} else {
				oWizard.validateStep(oElement);
			}
		},

		/**
		 * Called from  WizardStep "invoiceStep" on <code>activate</code> or <code>liveChange</code>
		 * Hiddes button to next WizardStep if validation conditions are not fulfilled
		 */
		checkInvoiceStep: function () {
			var sAddress = this.getModel().getProperty("/InvoiceAddress/Address") || "";
			var sCity = this.getModel().getProperty("/InvoiceAddress/City") || "";
			var sZipCode = this.getModel().getProperty("/InvoiceAddress/ZipCode") || "";
			var sCountry = this.getModel().getProperty("/InvoiceAddress/Country") || "";
			var oElement = this.byId("invoiceStep");
			var oWizard = this.byId("shoppingCartWizard");

			if (sAddress.length < 2 || sCity.length < 2 || sZipCode.length < 2 || sCountry.length < 2) {
				oWizard.invalidateStep(oElement);
			} else {
				oWizard.validateStep(oElement);
			}
		},

		/**
		 * Called from WizardStep "DeliveryAddressStep" on <code>activate</code> or <code>liveChange</code>
		 * Hiddes button to next WizardStep if validation conditions are not fulfilled
		 */
		checkDeliveryStep: function () {
			var sAddress = this.getModel().getProperty("/DeliveryAddress/Address") || "";
			var sCity = this.getModel().getProperty("/DeliveryAddress/City") || "";
			var sZipCode = this.getModel().getProperty("/DeliveryAddress/ZipCode") || "";
			var sCountry = this.getModel().getProperty("/DeliveryAddress/Country") || "";
			var oElement = this.byId("deliveryAddressStep");
			var oWizard = this.byId("shoppingCartWizard");

			if (sAddress.length < 2 || sCity.length < 2 || sZipCode.length < 2 || sCountry.length < 2) {
				oWizard.invalidateStep(oElement);
			} else {
				oWizard.validateStep(oElement);
			}
		},

		/**
		 * Called from  Wizard on <code>complete</code>
		 * navigates to page "summaryPage"
		 */
		completedHandler: function () {
			this.byId("wizardNavContainer").to(this.byId("summaryPage"));
		},

		/**
		 * navigates to "home" for further shopping
		 */
		onReturnToShopButtonPress: function () {
			this.getRouter().navTo("home");
		},

		// *** the following functions are private "helper" functions ***

		/**
		 * Called from both <code>setPaymentMethod</code> and <code>setDifferentDeliveryAddress</code> functions.
		 * Shows warning message if user changes prior selected choice
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
							_oHistory[oParams.historyPath] = this.getModel().getProperty(oParams.modelPath);
						} else {
							this.getModel().setProperty(oParams.modelPath, _oHistory[oParams.historyPath]);
						}
					}.bind(this)
				});
			} else {
				_oHistory[oParams.historyPath] = this.getModel().getProperty(oParams.modelPath);
			}
		},

		/**
		 * Called from <code>handleWizardCancel</code> and <code>handleWizardSubmit</code> functions.
		 * Shows warning message, resets shopping cart and wizard if affirmed and navigates to given route
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
						var oModel =  this.getModel();
						var oCartModel =  this.getOwnerComponent().getModel("cartProducts");
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
