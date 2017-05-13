sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(jQuery, Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";

	var WizardController = Controller.extend("sap.m.sample.WizardCurrentStep.Branching", {
		onInit: function () {
			this.branchingWizard = this.getView().byId("BranchingWizard");
			this.radioBtnGroup = this.getView().byId("PathSelection");
		},
		onAfterRendering: function () {
			this.applyPath(0);
		},
		discardAndApplyPath: function (event) {
			var index = event.getParameter("selectedIndex");
			this.branchingWizard.discardProgress(this.branchingWizard.getSteps()[0]);
			this._findParentView().byId("selectBranchingCurrentStep").setSelectedKey(this.branchingWizard.getCurrentStep());
			this.applyPath(index);
		},
		/**
		 * This simulates some kind of user interraction.
		 * Normally we would have a wizard with some inputs inside the steps, and event listeners on the inputs, that should set the nextStep() association given some condition.
		 * Here we set it predeterminted (from the UI)
		 */
		applyPath: function (index) {
			this._lastPathApplied = index;
			var pathIds = this.radioBtnGroup.getButtons()[index].getText().split("->");
			for (var i = 0; i < pathIds.length - 1; i++) {
				var step = this.getView().byId(pathIds[i]);
				var nextStep = this.getView().byId(pathIds[i + 1]);
				step.setNextStep(nextStep);
			}

			this.getView().byId(pathIds[pathIds.length - 1]).setNextStep(null);
		},
		reapplyLastPath: function () {
			this.applyPath(this._lastPathApplied);
		},
		_findParentView: function () {
			var parent = this.getView().getParent();
			while (parent.getMetadata().getName() !== "sap.ui.core.mvc.XMLView") {
				parent = parent.getParent();
			}

			return parent;
		}
	});

	return WizardController;
});
