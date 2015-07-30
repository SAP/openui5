/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	var CLASSES = sap.m.WizardProgressNavigator.CLASSES,
		ATTRIBUTES = sap.m.WizardProgressNavigator.ATTRIBUTES,
		TEXT = sap.m.WizardProgressNavigator.TEXT,
		WizardProgressNavigatorRenderer = {};

	WizardProgressNavigatorRenderer.render = function (oRm, oControl) {
		this.startNavigator(oRm, oControl);

		this.renderList(oRm, oControl);

		this.endNavigator(oRm);
	};

	WizardProgressNavigatorRenderer.startNavigator = function (oRm, oControl) {
		oRm.write("<nav");
		oRm.writeControlData(oControl);
		oRm.writeAttribute("class", CLASSES.NAVIGATION);
		oRm.writeAttribute(ATTRIBUTES.STEP_COUNT, oControl.getStepCount());
		oRm.write(">");
	};

	WizardProgressNavigatorRenderer.renderList = function (oRm, oControl) {
		this.startList(oRm);
		this.renderSteps(oRm, oControl);

		if (oControl.getVaryingStepCount()) {
			this.renderSeparator(oRm);
		}

		this.endList(oRm);
	};

	WizardProgressNavigatorRenderer.startList = function (oRm) {
		oRm.write("<ul");
		oRm.writeAttribute("class", CLASSES.LIST);
		oRm.write(">");
	};

	WizardProgressNavigatorRenderer.renderSteps = function (oRm, oControl) {
		var sStepTitle = oControl._resourceBundle.getText(TEXT.STEP),
			iStepCount = oControl.getStepCount();

		for (var i = 1; i <= iStepCount; i++) {
			this.startStep(oRm, i);
			this.renderAnchor(oRm, sStepTitle, i);
			this.endStep(oRm);

			if (i < iStepCount) {
				this.renderSeparator(oRm);
			}
		}
	};

	WizardProgressNavigatorRenderer.startStep = function (oRm, iStepNumber) {
		oRm.write("<li");
		oRm.writeAttribute("class", CLASSES.STEP);
		oRm.writeAttribute(ATTRIBUTES.STEP, iStepNumber);
		oRm.write(">");
	};

	WizardProgressNavigatorRenderer.renderAnchor = function (oRm, sStepTitle, iAnchorNumber) {
		oRm.write("<a tabindex='-1' aria-disabled='true'");
		oRm.writeAttribute("class", CLASSES.ANCHOR);
		oRm.writeAttribute("title", sStepTitle + " " + iAnchorNumber);
		oRm.write(">");
		oRm.write(iAnchorNumber);
		oRm.write("</a>");
	};

	WizardProgressNavigatorRenderer.endStep = function (oRm) {
		oRm.write("</li>");
	};

	WizardProgressNavigatorRenderer.renderSeparator = function (oRm) {
		oRm.write("<li");
		oRm.writeAttribute("class", CLASSES.SEPARATOR);
		oRm.write("></li>");
	};

	WizardProgressNavigatorRenderer.endList = function (oRm) {
		oRm.write("</ul>");
	};

	WizardProgressNavigatorRenderer.endNavigator = function (oRm) {
		oRm.write("</nav>");
	};

	return WizardProgressNavigatorRenderer;

}, /* bExport= */ true);
