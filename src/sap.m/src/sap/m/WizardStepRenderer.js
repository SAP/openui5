/*!
 * ${copyright}
 */

sap.ui.define(function () {

	"use strict";

	var WizardStepRenderer = {
		apiVersion: 2
	};

	WizardStepRenderer.render = function (oRm, oStep) {
		this.startWizardStep(oRm, oStep);
		this.renderWizardStepTitle(oRm, oStep);
		this.renderContent(oRm, oStep);
		this.endWizardStep(oRm);
	};

	WizardStepRenderer.startWizardStep = function (oRm, oStep) {
		oRm.openStart("div", oStep)
			.accessibilityState(oStep, {
				labelledby: oStep.getId() + "-Title",
				role: "region"
			})
			.class("sapMWizardStep")
			.openEnd();
	};

	WizardStepRenderer.renderWizardStepTitle = function (oRm, oStep) {
		oRm.openStart("h3", oStep.getId() + "-Title")
			.class("sapMWizardStepTitle")
			.openEnd()
			.text(this._resolveOrder(oStep))
			.text(oStep.getTitle())
			.close("h3");
	};

	WizardStepRenderer.renderContent = function (oRm, oStep) {
		oStep.getContent().forEach(oRm.renderControl, oRm);
		oRm.renderControl(oStep.getAggregation("_nextButton"));
	};

	WizardStepRenderer.endWizardStep = function (oRm) {
		oRm.close("div");
	};

	WizardStepRenderer._resolveOrder = function (oStep) {
		var oData = oStep.getCustomData()
			.filter(function (oCustomData) {
				return oCustomData.getKey() === "stepIndex";
			})[0];

		return oData ? (oData.getValue() + ". ") : "";
	};

	return WizardStepRenderer;

}, /* bExport= */ true);
