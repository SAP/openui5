sap.ui.define([
	'sap/ui/core/mvc/Controller'
], function (Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.WizardCurrentStep.controller.Branching", {
		onInit: function () {
			this.branchingWizard = this.byId("BranchingWizard");
			this.radioBtnGroup = this.byId("PathSelection");
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
				var step = this.byId(pathIds[i]);
				var nextStep = this.byId(pathIds[i + 1]);
				step.setNextStep(nextStep);
			}

			this.byId(pathIds[pathIds.length - 1]).setNextStep(null);
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
});
