sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/base/Log"
], function(jQuery, Controller, JSONModel, MessageToast, Log) {
	"use strict";

	var WizardController = Controller.extend("sap.m.sample.WizardCurrentStep.C", {
		onInit: function () {
			this.linearWizard = this.byId("wizardViewLinear").byId("CreateProductWizard");
			this.branchingWizard = this.byId("wizardViewBranching").byId("BranchingWizard");
			this.model = new JSONModel({
				selectedShowCase: "linear",
				linearWizardSelectedStep: "PricingStep"
			});
			this.getView().setModel(this.model);
		},
		onCurrentStepChangeLinear: function (event) {
			this.linearWizard.setCurrentStep(this.byId("wizardViewLinear").byId(event.getParameter("selectedItem").getKey()));
		},
		onCurrentStepChangeBranching: function (event) {
			try {
				this.branchingWizard.setCurrentStep(this.byId("wizardViewBranching").byId(event.getParameter("selectedItem").getKey()));
			} catch (ex) {
				MessageToast.show(ex);
				Log.error(ex);
				this.byId("selectBranchingCurrentStep").setSelectedKey(this.branchingWizard.getCurrentStep());
				this.byId("wizardViewBranching").byId("BranchingWizard").getSteps()[0].$().firstFocusableDomRef().focus();
				this.byId("wizardViewBranching").getController().reapplyLastPath();
			}
		}
	});

	return WizardController;
});
