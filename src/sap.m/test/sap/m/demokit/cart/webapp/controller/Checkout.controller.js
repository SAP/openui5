sap.ui.define([
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/demo/cart/model/cart',
	'sap/ui/model/json/JSONModel',
	'sap/ui/Device',
	'sap/ui/demo/cart/model/formatter',
	'sap/m/MessageToast',
	'sap/m/MessageBox'
], function (BaseController, cart, JSONModel, Device, formatter, MessageToast, MessageBox) {
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
					CashOnDelivery:{},
					BillingAddress:{},
					DeliveryAddress:{},
					CreditCard:{}
				}
			);
			this.getView().setModel(oModel);
		},

		/**
		 * Shows next WizardStep according to user selection
		 */
		goToPaymentStep: function () {
			var selectedKey = this.getModel().getProperty("/SelectedPayment");
			var oElement = this.byId("paymentTypeStep");
			switch (selectedKey) {
				case "Credit Card" :
					oElement.setNextStep(this.byId("creditCardStep"));
					break;
				case "Bank Transfer" :
					oElement.setNextStep(this.byId("bankAccountStep"));
					break;
				case "Cash on Delivery" :
					oElement.setNextStep(this.byId("cashOnDeliveryStep"));
					break;
			}
		},

		/**
		 * Shows warning message if user changes prior selected payment method
		 */
		setPaymentMethod: function () {
			this._setDiscardableProperty({
				message: this.getResourceBundle().getText("checkoutControllerChangepayment"),
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
				message: this.getResourceBundle().getText("checkoutControllerChangedelivery"),
				discardStep: this.byId("billingStep"),
				modelPath: "/DifferentDeliveryAddress",
				historyPath: "prevDiffDeliverySelect"
			});
		},

		/**
		 * Called from WizardStep "BillingStep"
		 * shows next WizardStep "DeliveryAddressStep" or "DeliveryTypeStep" according to user selection
		 */
		billingAddressComplete: function () {
			var sNextStepId = (this.getModel().getProperty("/DifferentDeliveryAddress"))
				? "deliveryAddressStep"
				: "deliveryTypeStep";
			this.byId("billingStep").setNextStep(this.byId(sNextStepId));

		},

		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and cancels order if affirmed
		 */
		handleWizardCancel: function () {
			var sText=this.getResourceBundle().getText("checkoutControllerAreyousurecancel");
			this._handleSubmitOrCancel(sText, "warning", "home");
		},

		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and submits order if affirmed
		 */
		handleWizardSubmit: function () {
			var sText=this.getResourceBundle().getText("checkoutControllerAreyousuresubmit");
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
			var oElement=this.byId("creditCardStep")
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
			var oElement=this.byId("cashOnDeliveryStep")
			var oWizard = this.byId("shoppingCartWizard");
			if (sFirstName.length < 2) {
				oWizard.invalidateStep(oElement);
			} else {
				oWizard.validateStep(oElement);
			}
		},

		/**
		 * Called from  WizardStep "BillingStep" on <code>activate</code> or <code>liveChange</code>
		 * Hiddes button to next WizardStep if validation conditions are not fulfilled
		 */
		checkBillingStep: function () {
			var sAddress = this.getModel().getProperty("/BillingAddress/Address") || "";
			var sCity = this.getModel().getProperty("/BillingAddress/City") || "";
			var sZipCode = this.getModel().getProperty("/BillingAddress/ZipCode") || "";
			var sCountry = this.getModel().getProperty("/BillingAddress/Country") || "";
			var oElement=this.byId("billingStep")
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
			var oElement=this.byId("deliveryAddressStep")
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
		 * navigates to "cart" for further shopping / editing
		 */
		onReturnToShopButtonPress: function () {
			this.getRouter().navTo("cart");
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
						oModelData.BillingAddress = {};
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
			var _fnAfterNavigate=(function () {
				this.byId("shoppingCartWizard").goToStep(oStep);
				// detaches itself after navigaton
				oNavContainer.detachAfterNavigate(_fnAfterNavigate);
			}).bind(this);

			oNavContainer.attachAfterNavigate(_fnAfterNavigate);
			oNavContainer.to(this.byId("wizardContentPage"));
		}
	});
});