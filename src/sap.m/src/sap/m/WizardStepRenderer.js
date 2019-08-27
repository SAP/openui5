/*!
 * ${copyright}
 */

sap.ui.define(function () {

	"use strict";

	var WizardStepRenderer = {};

	WizardStepRenderer.render = function (oRm, oStep) {
		this.startWizardStep(oRm, oStep);
		this.renderWizardStepTitle(oRm, oStep);
		this.renderContent(oRm, oStep);
		this.endWizardStep(oRm);
	};

	WizardStepRenderer.startWizardStep = function (oRm, oStep) {
		oRm.write("<div");
		oRm.writeAccessibilityState(oStep, {
			"labelledby": oStep._getNumberInvisibleText().getId(),
			"role": "region"
		});
		oRm.writeControlData(oStep);
		oRm.addClass("sapMWizardStep");
		oRm.writeClasses();
		oRm.write(">");
	};

	WizardStepRenderer.renderWizardStepTitle = function (oRm, oStep) {
		oRm.write("<h3 class='sapMWizardStepTitle' id='" + this.getTitleId(oStep) + "'>");
		oRm.writeEscaped(oStep.getTitle());
		oRm.write("</h3>");
	};

	WizardStepRenderer.getTitleId = function (oStep) {
		return oStep.getId() + "-Title";
	};

	WizardStepRenderer.renderContent = function (oRm, oStep) {
		oStep.getContent().forEach(oRm.renderControl, oRm);
		oRm.renderControl(oStep.getAggregation("_nextButton"));
	};

	WizardStepRenderer.endWizardStep = function (oRm) {
		oRm.write("</div>");
	};

	return WizardStepRenderer;

}, /* bExport= */ true);
