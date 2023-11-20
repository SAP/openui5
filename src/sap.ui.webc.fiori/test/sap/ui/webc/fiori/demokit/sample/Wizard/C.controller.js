sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/webc/main/Toast"
], function(Controller, JSONModel, Toast) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.Wizard.C", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		handleStepChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event stepChange fired.");
			demoToast.show();
		},
		navigateToNextStep: function(oCurrentStep, oNextStep) {
			if (!oCurrentStep || !oNextStep) {
				return;
			}

			oCurrentStep.setSelected(false);
			oNextStep.setEnabled(true);
			oNextStep.setSelected(true);
		},
		navigateToSecondStep: function() {
			this.navigateToNextStep(this.getView().byId("first-step"), this.getView().byId("second-step"));
		},
		navigateToThirdStep: function() {
			this.navigateToNextStep(this.getView().byId("second-step"), this.getView().byId("third-step"));
		},
		navigateToLastStep: function() {
			this.navigateToNextStep(this.getView().byId("third-step"), this.getView().byId("last-step"));
		},
		handleWizardEnd: function() {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Product successfully added!");
			demoToast.show();
		}
	});
});