sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(jQuery, Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";

	var WizardController = Controller.extend("sap.m.sample.Wizard.C", {
		onInit: function () {
			this._wizard = this.getView().byId("CreateProductWizard");
			this._oNavContainer = this.getView().byId("wizardNavContainer");
			this._oWizardContentPage = this.getView().byId("wizardContentPage");
			this._oWizardReviewPage = sap.ui.xmlfragment("sap.m.sample.Wizard.ReviewPage", this);

			this._oNavContainer.addPage(this._oWizardReviewPage);
			this.model = new sap.ui.model.json.JSONModel();
			this.model.setData({
				productNameState:"Error",
				productWeightState:"Error"
			});
			this.getView().setModel(this.model);
			this.model.setProperty("/productType", "Mobile");
			this.model.setProperty("/navApiEnabled", true);
			this.model.setProperty("/productVAT", false);
			this._setEmptyValue("/productManufacturer");
			this._setEmptyValue("/productDescription");
			this._setEmptyValue("/productPrice");
		},
		setProductType: function (evt) {
			var productType = evt.getSource().getTitle();
			this.model.setProperty("/productType", productType);
			this.getView().byId("ProductStepChosenType").setText("Chosen product type: " + productType);
			this._wizard.validateStep(this.getView().byId("ProductTypeStep"));
		},
		setProductTypeFromSegmented: function (evt) {
			var productType = evt.mParameters.button.getText();
			this.model.setProperty("/productType", productType);
			this._wizard.validateStep(this.getView().byId("ProductTypeStep"));
		},
		additinalInfoValidation : function () {
			var name = this.getView().byId("ProductName").getValue();
			var weight = parseInt(this.getView().byId("ProductWeight").getValue());

			isNaN(weight) ? this.model.setProperty("/productWeightState", "Error") : this.model.setProperty("/productWeightState", "None");
			name.length<6 ?  this.model.setProperty("/productNameState", "Error") : this.model.setProperty("/productNameState", "None");

			if (name.length < 6 || isNaN(weight))
				this._wizard.invalidateStep(this.getView().byId("ProductInfoStep"));
			else
				this._wizard.validateStep(this.getView().byId("ProductInfoStep"));
		},
		optionalStepActivation: function () {
			MessageToast.show(
				'This event is fired on activate of Step3.'
			);
		},
		optionalStepCompletion: function () {
			MessageToast.show(
				'This event is fired on complete of Step3. You can use it to gather the information, and lock the input data.'
			);
		},
		pricingActivate: function () {
			this.model.setProperty("/navApiEnabled", true);
		},
		pricingComplete: function () {
			this.model.setProperty("/navApiEnabled", false);
		},
		scrollFrom4to2 : function () {
			this._wizard.goToStep(this.getView().byId("ProductInfoStep"));
		},
		goFrom4to3 : function () {
			if (this._wizard.getProgressStep() === this.getView().byId("PricingStep"))
				this._wizard.previousStep();
		},
		goFrom4to5 : function () {
			if (this._wizard.getProgressStep() === this.getView().byId("PricingStep"))
				this._wizard.nextStep();
		},
		wizardCompletedHandler : function () {
			this._oNavContainer.to(this._oWizardReviewPage);
		},
		backToWizardContent : function () {
			this._oNavContainer.backToPage(this._oWizardContentPage.getId());
		},
		editStepOne : function () {
			this._handleNavigationToStep(0);
		},
		editStepTwo : function () {
			this._handleNavigationToStep(1);
		},
		editStepThree : function () {
			this._handleNavigationToStep(2);
		},
		editStepFour : function () {
			this._handleNavigationToStep(3);
		},
		_handleNavigationToStep : function (iStepNumber) {
			var that = this;
			function fnAfterNavigate () {
				that._wizard.goToStep(that._wizard.getSteps()[iStepNumber]);
				that._oNavContainer.detachAfterNavigate(fnAfterNavigate);
			}

			this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
			this.backToWizardContent();
		},
		_handleMessageBoxOpen : function (sMessage, sMessageBoxType) {
			var that = this;
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						that._handleNavigationToStep(0);
						that._wizard.discardProgress(that._wizard.getSteps()[0]);
					}
				},
			});
		},
		_setEmptyValue : function (sPath) {
			this.model.setProperty(sPath, "n/a");
		},
		handleWizardCancel : function () {
			this._handleMessageBoxOpen("Are you sure you want to cancel your report?", "warning");
		},
		handleWizardSubmit : function () {
			this._handleMessageBoxOpen("Are you sure you want to submit your report?", "confirm");
		},
		productWeighStateFormatter: function (val) {
			return isNaN(val) ? "Error" : "None";
		},
		discardProgress: function () {
			this._wizard.discardProgress(this.getView().byId("ProductTypeStep"));

			var clearContent = function (content) {
				for (var i = 0; i < content.length ; i++) {
					if (content[i].setValue) {
						content[i].setValue("");
					}

					if (content[i].getContent) {
						clearContent(content[i].getContent());
					}
				}
			};

			this.model.setProperty("/productWeightState", "Error");
			this.model.setProperty("/productNameState", "Error")
			clearContent(this._wizard.getSteps());
		}
	});

	return WizardController;
});
