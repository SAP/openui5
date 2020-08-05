sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/base/Log"
], function (Controller, JSONModel, MessageToast, Log) {
	"use strict";

	return Controller.extend("sap.m.sample.WizardCurrentStep.controller.WizardCurrentStep", {
		onInit: function () {
			this.linearWizard = this.byId("wizardViewLinear");
			this.branchingWizard = this.byId("wizardViewBranching");
			this.model = new JSONModel({
				selectedBackgroundDesign: "Standard",
				selectedShowCase: "linear",
				linearWizardSelectedStep: "PricingStep"
			});
			this.getView().setModel(this.model);
		},

		onCurrentStepChangeLinear: function (event) {
			var oProductWizard = this.linearWizard.byId("CreateProductWizard");

			oProductWizard.setCurrentStep(this.byId("wizardViewLinear").byId(event.getParameter("selectedItem").getKey()));
		},

		onBackgroundDesignChange: function (event) {
			var oProductWizard = this.linearWizard.byId("CreateProductWizard"),
				oBranchingWizard = this.branchingWizard.byId("BranchingWizard");

			oProductWizard.setBackgroundDesign(event.getParameter("selectedItem").getKey());
			oBranchingWizard.setBackgroundDesign(event.getParameter("selectedItem").getKey());
		},

		onCurrentStepChangeBranching: function (event) {
			var oBranchingWizard = this.branchingWizard.byId("BranchingWizard");

			try {
				oBranchingWizard.setCurrentStep(this.byId("wizardViewBranching").byId(event.getParameter("selectedItem").getKey()));
			} catch (ex) {
				MessageToast.show(ex);
				Log.error(ex);
				this.byId("selectBranchingCurrentStep").setSelectedKey(this.branchingWizard.getCurrentStep());
				this.byId("wizardViewBranching").byId("BranchingWizard").getSteps()[0].$().firstFocusableDomRef().focus();
				this.byId("wizardViewBranching").getController().reapplyLastPath();
			}
		}
	});
});
