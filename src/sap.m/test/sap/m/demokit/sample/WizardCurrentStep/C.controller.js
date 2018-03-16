sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(jQuery, Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";

	var WizardController = Controller.extend("sap.m.sample.WizardCurrentStep.C", {
		onInit: function () {
			this.linearWizard = this.byId("wizardViewLinear").byId("CreateProductWizard");
			this.branchingWizard = this.byId("wizardViewBranching").byId("BranchingWizard");
			this.model = new JSONModel({
				selectedShowCase: "linear"
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
				jQuery.sap.log.error(ex);
				this.byId("selectBranchingCurrentStep").setSelectedKey(this.branchingWizard.getCurrentStep());
				this.byId("wizardViewBranching").byId("BranchingWizard").getSteps()[0].$().firstFocusableDomRef().focus();
				this.byId("wizardViewBranching").getController().reapplyLastPath();
			}
		}
	});

	return WizardController;
});
