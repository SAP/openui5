/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	var WizardRenderer = {};

	WizardRenderer.render = function (oRm, oWizard) {
		oRm.write("<div");
		oRm.writeControlData(oWizard);
		oRm.addClass("sapMWizard");
		oRm.writeClasses();
		oRm.addStyle("width", oWizard.getWidth());
		oRm.addStyle("height", oWizard.getHeight());
		oRm.writeStyles();
		oRm.write(">");

		oRm.renderControl(oWizard.getAggregation("_page"));
		oRm.renderControl(oWizard.getAggregation("_nextButton"));

		oRm.write("</div>");
	};

	return WizardRenderer;

}, /* bExport= */ true);
