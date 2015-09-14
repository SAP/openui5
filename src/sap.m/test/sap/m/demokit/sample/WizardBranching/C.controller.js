sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(jQuery, Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";

	var history = {
		prevPaymentSelect: null,
		prevDiffDeliverySelect: null
	};

	var WizardController = Controller.extend("sap.m.sample.WizardBranching.C", {
		onInit: function () {
			var that = this;
			this._wizard = this.getView().byId("ShoppingCartWizard");
			this._oNavContainer = this.getView().byId("wizardNavContainer");
			this._oWizardContentPage = this.getView().byId("wizardContentPage");
			this._oWizardReviewPage = sap.ui.xmlfragment("sap.m.sample.WizardBranching.ReviewPage", this);

			this._oNavContainer.addPage(this._oWizardReviewPage);
			this.model = new sap.ui.model.json.JSONModel();
			this.model.attachRequestCompleted(null, function () {
				that.model.getData().ProductCollection.splice(5,that.model.getData().ProductCollection.length);
				that.model.setProperty("/selectedPayment", "Credit Card");
				that.model.setProperty("/selectedDeliveryMethod", "Standard Delivery");
				that.model.setProperty("/differentDeliveryAddress", false);
				that.model.setProperty("/CashOnDelivery", {});
				that.model.setProperty("/BillingAddress", {});
				that.model.setProperty("/CreditCard", {});
				that.calcTotal();
				that.model.updateBindings();
			});

			this.model.loadData(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(this.model);
		},
		calcTotal: function () {
			var data = this.model.getData().ProductCollection;
			if (data) {
				var total = data.reduce(function (prev, current) {
					prev = prev.Price || prev;
					return prev + current.Price;
				});
				this.model.setProperty("/ProductsTotalPrice", total.Price || total);
			} else {
				this.model.setProperty("/ProductsTotalPrice", 0);
			}
		},
		handleDelete: function (listItemBase) {
			var listItem = listItemBase.mParameters.listItem;
			var data = this.model.getData().ProductCollection;
			if (data.length <= 1) {
				return;
			}

			for (var i = 0 ; i < data.length; i++) {
				if (data[i].Name === listItem.getTitle()) {
					data.splice(i, 1);
					this.calcTotal();
					this.model.updateBindings();
					break;
				}
			}
		},
		goToPaymentStep: function () {
			var selectedKey = this.model.getProperty("/selectedPayment");

			switch (selectedKey) {
				case "Credit Card" :
					this.getView().byId("PaymentTypeStep").setNextStep(this.getView().byId("CreditCardStep"));
					break;
				case "Bank Transfer" :
					this.getView().byId("PaymentTypeStep").setNextStep(this.getView().byId("BankAccountStep"));
					break;
				case "Cash on Delivery" :
					this.getView().byId("PaymentTypeStep").setNextStep(this.getView().byId("CashOnDeliveryStep"));
					break;
			}
		},
		setPaymentMethod: function () {
			this.setDiscardableProperty({
				message: "Are you sure you want to change the payment type ? This will discard your progress.",
				discardStep:this.getView().byId("PaymentTypeStep"),
				modelPath: "/selectedPayment",
				historyPath: "prevPaymentSelect"
			});
		},
		setDifferentDeliveryAddress: function () {
			this.setDiscardableProperty({
				message: "Are you sure you want to change the delivery address ? This will discard your progress",
				discardStep:this.getView().byId("BillingStep"),
				modelPath: "/differentDeliveryAddress",
				historyPath: "prevDiffDeliverySelect"
			});
		},
		setDiscardableProperty : function (params) {
			var that = this;
			if (this._wizard.getProgressStep() !== params.discardStep) {
				MessageBox.warning(params.message, {
					actions:[MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === MessageBox.Action.YES) {
							that._wizard.discardProgress(params.discardStep);
							history[params.historyPath] = that.model.getProperty(params.modelPath);
						} else {
							that.model.setProperty(params.modelPath, history[params.historyPath]);
						}
					}
				});
			} else {
				history[params.historyPath] = this.model.getProperty(params.modelPath);
			}
		},
		billingAddressComplete: function () {
			if (this.model.getProperty("/differentDeliveryAddress")) {
				this.getView().byId("BillingStep").setNextStep(this.getView().byId("DeliveryAddressStep"));
			} else {
				this.getView().byId("BillingStep").setNextStep(this.getView().byId("DeliveryTypeStep"));
			}
		},
		handleWizardCancel : function () {
			this._handleMessageBoxOpen("Are you sure you want to cancel your purchase?", "warning");
		},
		handleWizardSubmit : function () {
			this._handleMessageBoxOpen("Are you sure you want to submit your report?", "confirm");
		},
		backToWizardContent: function () {
			this._oNavContainer.backToPage(this._oWizardContentPage.getId());
		},
		checkCreditCardStep: function () {
			var cardName = this.model.getProperty("/CreditCard/Name") || "";
			if (cardName.length < 3) {
				this._wizard.invalidateStep(this.getView().byId("CreditCardStep"));
			} else {
				this._wizard.validateStep(this.getView().byId("CreditCardStep"));
			}
		},
		checkCashOnDeliveryStep: function () {
			var firstName = this.model.getProperty("/CashOnDelivery/FirstName") || "";
			if (firstName.length < 3) {
				this._wizard.invalidateStep(this.getView().byId("CashOnDeliveryStep"));
			} else {
				this._wizard.validateStep(this.getView().byId("CashOnDeliveryStep"));
			}
		},
		checkBillingStep: function () {
			var address = this.model.getProperty("/BillingAddress/Address") || "";
			var city = this.model.getProperty("/BillingAddress/City") || "";
			var zipCode = this.model.getProperty("/BillingAddress/ZipCode") || "";
			var country = this.model.getProperty("/BillingAddress/Country") || "";

			if (address.length < 3 || city.length < 3 || zipCode.length < 3 || country.length < 3) {
				this._wizard.invalidateStep(this.getView().byId("BillingStep"));
			} else {
				this._wizard.validateStep(this.getView().byId("BillingStep"));
			}
		},
		completedHandler: function () {
			this._oNavContainer.to(this._oWizardReviewPage);
		},
		_handleMessageBoxOpen : function (sMessage, sMessageBoxType) {
			var that = this;
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						that._wizard.discardProgress(that._wizard.getSteps()[0]);
						that._navBackToList();
					}
				}
			});
		},
		_navBackToList: function () {
			this._navBackToStep(this.getView().byId("ContentsStep"));
		},
		_navBackToPaymentType: function () {
			this._navBackToStep(this.getView().byId("PaymentTypeStep"));
		},
		_navBackToCreditCard: function () {
			this._navBackToStep(this.getView().byId("CreditCardStep"));
		},
		_navBackToCashOnDelivery: function () {
			this._navBackToStep(this.getView().byId("CashOnDeliveryStep"));
		},
		_navBackToBillingAddress: function () {
			this._navBackToStep(this.getView().byId("BillingStep"));
		},
		_navBackToDeliveryType: function () {
			this._navBackToStep(this.getView().byId("DeliveryTypeStep"));
		},
		_navBackToStep: function (step) {
			var that = this;

			function fnAfterNavigate () {
				that._wizard.goToStep(step);
				that._oNavContainer.detachAfterNavigate(fnAfterNavigate);
			}

			this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
			this._oNavContainer.to(this._oWizardContentPage);
		}
	});

	return WizardController;
});
