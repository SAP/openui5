sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/core/library"
], function (Controller, JSONModel, MessageToast, MessageBox, Fragment, CoreLibrary) {
	"use strict";

	var ValueState = CoreLibrary.ValueState,
		oData = {
			productNameState: ValueState.Error,
			productWeightState: ValueState.Error,
			productType: "Mobile",
			reviewButton: false,
			backButtonVisible: false,
			availabilityType: "In store",
			productVAT: false,
			measurement: "",
			productManufacturer: "N/A",
			productDescription: "N/A",
			size: "N/A",
			productPrice: "N/A",
			manufacturingDate: "N/A",
			discountGroup: ""
		};

	return Controller.extend("sap.m.sample.WizardSingleStep.controller.WizardSingleStep", {
		onInit: function () {
			var oModel = new JSONModel(),
				oInitialModelState = Object.assign({}, oData);

			oModel.setData(oInitialModelState);
			this.getView().setModel(oModel);
		},

		handleOpenDialog: function () {
			var oView = this.getView();

			// create Dialog
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.WizardSingleStep.view.WizardSingleStep",
					controller: this
				}).then(function(oDialog) {
					oDialog.attachAfterOpen(this.onDialogAfterOpen, this);
					oView.addDependent(oDialog);
					oDialog.bindElement("/ProductCollection/0");
					return oDialog;
				}.bind(this));
			}
			this._pDialog.then(function(oDialog){
				oDialog.open();
			});
		},

		onDialogAfterOpen: function () {
			this._oWizard = this.byId("CreateProductWizard");
			this._iSelectedStepIndex = 0;
			this._oSelectedStep = this._oWizard.getSteps()[this._iSelectedStepIndex];

			this.handleButtonsVisibility();
		},

		handleButtonsVisibility: function () {
			var oModel = this.getView().getModel();
			switch (this._iSelectedStepIndex){
				case 0:
					oModel.setProperty("/nextButtonVisible", true);
					oModel.setProperty("/nextButtonEnabled", true);
					oModel.setProperty("/backButtonVisible", false);
					oModel.setProperty("/reviewButtonVisible", false);
					oModel.setProperty("/finishButtonVisible", false);
					break;
				case 1:
					oModel.setProperty("/backButtonVisible", true);
					oModel.setProperty("/nextButtonVisible", true);
					oModel.setProperty("/reviewButtonVisible", false);
					oModel.setProperty("/finishButtonVisible", false);
					break;
				case 2:
					oModel.setProperty("/nextButtonVisible", true);
					oModel.setProperty("/backButtonVisible", true);
					oModel.setProperty("/reviewButtonVisible", false);
					oModel.setProperty("/finishButtonVisible", false);
					break;
				case 3:
					oModel.setProperty("/nextButtonVisible", false);
					oModel.setProperty("/backButtonVisible", true);
					oModel.setProperty("/reviewButtonVisible", true);
					oModel.setProperty("/finishButtonVisible", false);
					break;
				case 4:
					oModel.setProperty("/nextButtonVisible", false);
					oModel.setProperty("/finishButtonVisible", true);
					oModel.setProperty("/backButtonVisible", false);
					oModel.setProperty("/reviewButtonVisible", false);
					break;
				default: break;
			}

		},

		handleNavigationChange: function (oEvent) {
			this._oSelectedStep = oEvent.getParameter("step");
			this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
			this.handleButtonsVisibility();
		},

		setProductType: function (oEvent) {
			var sProductType = oEvent.getSource().getTitle();
			this.getView().getModel().setProperty("/productType", sProductType);
			this.byId("ProductStepChosenType").setText("Chosen product type: " + sProductType);
			this._oWizard.validateStep(this.byId("ProductTypeStep"));
		},

		setProductTypeFromSegmented: function (oEvent) {
			var sProductType = oEvent.getParameters().item.getText();
			this.getView().getModel().setProperty("/productType", sProductType);
			this._oWizard.validateStep(this.byId("ProductTypeStep"));
		},

		additionalInfoValidation: function () {
			var oModel = this.getView().getModel(),
				sName = this.byId("ProductName").getValue(),
				iWeight = parseInt(this.byId("ProductWeight").getValue());

			this.handleButtonsVisibility();

			if (isNaN(iWeight)) {
				this._oWizard.setCurrentStep(this.byId("ProductInfoStep"));
				oModel.setProperty("/productWeightState", ValueState.Error);
			} else {
				oModel.setProperty("/productWeightState", ValueState.None);
			}

			if (sName.length < 6) {
				this._oWizard.setCurrentStep(this.byId("ProductInfoStep"));
				oModel.setProperty("/productNameState", ValueState.Error);
			} else {
				oModel.setProperty("/productNameState", ValueState.None);
			}

			if (sName.length < 6 || isNaN(iWeight)) {
				this._oWizard.invalidateStep(this.byId("ProductInfoStep"));
				oModel.setProperty("/nextButtonEnabled", false);
				oModel.setProperty("/finishButtonVisible", false);
			} else {
				this._oWizard.validateStep(this.byId("ProductInfoStep"));
				oModel.setProperty("/nextButtonEnabled", true);
			}
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

		editStepOne: function () {
			this._handleNavigationToStep(0);
		},

		editStepTwo: function () {
			this._handleNavigationToStep(1);
		},

		editStepThree: function () {
			this._handleNavigationToStep(2);
		},

		editStepFour: function () {
			this._handleNavigationToStep(3);
		},

		_handleNavigationToStep: function (iStepNumber) {
			this._pDialog.then(function(oDialog){
				oDialog.open();
				this._oWizard.goToStep(this._oWizard.getSteps()[iStepNumber], true);
			}.bind(this));
		},

		_handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
						this.byId("wizardDialog").close();
						this.getView().getModel().setData(Object.assign({}, oData));
					}
				}.bind(this)
			});
		},

		onDialogNextButton: function () {
			this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
			var oNextStep = this._oWizard.getSteps()[this._iSelectedStepIndex + 1];

			if (this._oSelectedStep && !this._oSelectedStep.bLast) {
				this._oWizard.goToStep(oNextStep, true);
			} else {
				this._oWizard.nextStep();
			}

			this._iSelectedStepIndex++;
			this._oSelectedStep = oNextStep;

			this.handleButtonsVisibility();
		},

		onDialogBackButton: function () {
			this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
			var oPreviousStep = this._oWizard.getSteps()[this._iSelectedStepIndex - 1];

			if (this._oSelectedStep) {
				this._oWizard.goToStep(oPreviousStep, true);
			} else {
				this._oWizard.previousStep();
			}

			this._iSelectedStepIndex--;
			this._oSelectedStep = oPreviousStep;

			this.handleButtonsVisibility();
		},

		handleWizardCancel: function () {
			this._handleMessageBoxOpen("Are you sure you want to cancel your report?", "warning");
		},

		handleWizardSubmit: function () {
			this._handleMessageBoxOpen("Are you sure you want to submit your report?", "confirm");
		},

		productWeighStateFormatter: function (oVal) {
			return isNaN(oVal) ? ValueState.Error : ValueState.None;
		},

		discardProgress: function () {
			var oModel = this.getView().getModel();
			this._oWizard.discardProgress(this.byId("ProductTypeStep"));

			var clearContent = function (aContent) {
				for (var i = 0; i < aContent.length; i++) {
					if (aContent[i].setValue) {
						aContent[i].setValue("");
					}

					if (aContent[i].getContent) {
						clearContent(aContent[i].getContent());
					}
				}
			};

			oModel.setProperty("/productWeightState", ValueState.Error);
			oModel.setProperty("/productNameState", ValueState.Error);
			clearContent(this._oWizard.getSteps());
		}
	});
});
