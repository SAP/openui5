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
			// create Dialog
			if (!this._oDialog) {
				Fragment.load({
					id: "WizardDialog",
					name: "sap.m.sample.WizardSingleStep.view.WizardSingleStep",
					controller: this
				}).then(function(pDialog) {
					this._oDialog = pDialog;
					this._oDialog.attachAfterOpen(this.onDialogAfterOpen, this);
					this.getView().addDependent(this._oDialog);
					this._oDialog.bindElement("/ProductCollection/0");
					this._oDialog.open();
				}.bind(this));
			} else {
				this._oDialog.open();
			}
		},

		onDialogAfterOpen: function () {
			this._oWizard = Fragment.byId("WizardDialog", "CreateProductWizard");

			this.handleButtonsVisibility();
		},

		handleButtonsVisibility: function () {
			var oModel = this.getView().getModel();
			switch (this._oWizard.getProgress()){
				case 1:
					oModel.setProperty("/nextButtonVisible", true);
					oModel.setProperty("/nextButtonEnabled", true);
					oModel.setProperty("/backButtonVisible", false);
					oModel.setProperty("/reviewButtonVisible", false);
					oModel.setProperty("/finishButtonVisible", false);
					break;
				case 2:
					oModel.setProperty("/backButtonVisible", true);
					break;
				case 3:
					oModel.setProperty("/nextButtonVisible", true);
					oModel.setProperty("/reviewButtonVisible", false);
					break;
				case 4:
					oModel.setProperty("/nextButtonVisible", false);
					oModel.setProperty("/reviewButtonVisible", true);
					oModel.setProperty("/finishButtonVisible", false);
					break;
				case 5:
					oModel.setProperty("/finishButtonVisible", true);
					oModel.setProperty("/backButtonVisible", false);
					oModel.setProperty("/reviewButtonVisible", false);
					break;
				default: break;
			}

		},

		setProductType: function (oEvent) {
			var sProductType = oEvent.getSource().getTitle();
			this.getView().getModel().setProperty("/productType", sProductType);
			Fragment.byId("WizardDialog", "ProductStepChosenType").setText("Chosen product type: " + sProductType);
			this._oWizard.validateStep(Fragment.byId("WizardDialog", "ProductTypeStep"));
		},

		setProductTypeFromSegmented: function (oEvent) {
			var sProductType = oEvent.getParameters().item.getText();
			this.getView().getModel().setProperty("/productType", sProductType);
			this._oWizard.validateStep(Fragment.byId("WizardDialog", "ProductTypeStep"));
		},

		additionalInfoValidation: function () {
			var oModel = this.getView().getModel(),
				sName = Fragment.byId("WizardDialog", "ProductName").getValue(),
				iWeight = parseInt(Fragment.byId("WizardDialog", "ProductWeight").getValue());

			this.handleButtonsVisibility();

			if (isNaN(iWeight)) {
				oModel.setProperty("/productWeightState", ValueState.Error);
			} else {
				oModel.setProperty("/productWeightState", ValueState.None);
			}

			if (sName.length < 6) {
				oModel.setProperty("/productNameState", ValueState.Error);
			} else {
				oModel.setProperty("/productNameState", ValueState.None);
			}

			if (sName.length < 6 || isNaN(iWeight)) {
				this._oWizard.invalidateStep(Fragment.byId("WizardDialog", "ProductInfoStep"));
				oModel.setProperty("/nextButtonEnabled", false);
				oModel.setProperty("/finishButtonVisible", false);
			} else {
				this._oWizard.validateStep(Fragment.byId("WizardDialog", "ProductInfoStep"));
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
			this._oDialog.open();
			this._oWizard.goToStep(this._oWizard.getSteps()[iStepNumber], true);
		},

		_handleMessageBoxOpen: function (sMessage, sMessageBoxType) {
			MessageBox[sMessageBoxType](sMessage, {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.YES) {
						this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
						this._oDialog.close();
						this.getView().getModel().setData(Object.assign({}, oData));
					}
				}.bind(this)
			});
		},

		onDialogNextButton: function () {
			if (this._oWizard.getProgressStep().getValidated()) {
				this._oWizard.nextStep();
			}

			this.handleButtonsVisibility();
		},

		onDialogBackButton: function () {
			this._oWizard.previousStep();
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
			this._oWizard.discardProgress(Fragment.byId("WizardDialog", "ProductTypeStep"));

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
