/*!
 * ${copyright}
 */

sap.ui.define(["./WizardProgressNavigator"], function (WizardProgressNavigator) {
	"use strict";

	var CLASSES = WizardProgressNavigator.CLASSES,
		ATTRIBUTES = WizardProgressNavigator.ATTRIBUTES,
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
		this.startList(oRm, oControl);
		this.renderSteps(oRm, oControl);
		this.endList(oRm);
	};

	WizardProgressNavigatorRenderer.startList = function (oRm, oControl) {
		var aStepTitles = oControl.getStepTitles();

		oRm.write("<ul");

		if (oControl.getVaryingStepCount()) {
			oRm.addClass(CLASSES.LIST_VARYING);
		} else {
			oRm.addClass(CLASSES.LIST);
		}

		if (!aStepTitles.length) {
			oRm.addClass(CLASSES.LIST_NO_TITLES);
		}

		oRm.writeClasses();
		oRm.write(">");
	};

	WizardProgressNavigatorRenderer.renderSteps = function (oRm, oControl) {
		var iStepCount = oControl.getStepCount(),
			aStepTitles = oControl.getStepTitles(),
			aStepIcons = oControl.getStepIcons();

		for (var i = 1; i <= iStepCount; i++) {
			this.startStep(oRm, i);
			this.renderAnchor(oRm, i, aStepTitles[i - 1], aStepIcons[i - 1]);
			this.endStep(oRm);
		}
	};

	WizardProgressNavigatorRenderer.startStep = function (oRm, iStepNumber) {
		oRm.write("<li");
		oRm.writeAttribute("class", CLASSES.STEP);
		oRm.writeAttribute(ATTRIBUTES.STEP, iStepNumber);
		oRm.write(">");
	};

	WizardProgressNavigatorRenderer.renderAnchor = function (oRm, iStepNumber, sStepTitle, sIconUri) {
		oRm.write("<a tabindex='-1' aria-disabled='true'");
		oRm.writeAttribute("class", CLASSES.ANCHOR);

		if (sStepTitle) {
			oRm.writeAttributeEscaped("title", sStepTitle);
		} else {
			oRm.writeAttributeEscaped("title", "Step " + iStepNumber);
		}

		oRm.write(">");

		oRm.write("<span");
		oRm.writeAttribute("class", CLASSES.ANCHOR_CIRCLE);
		oRm.write(">");

		if (sIconUri) {
			oRm.writeIcon(sIconUri, [CLASSES.ANCHOR_ICON], {title: null});
		} else {
			oRm.write(iStepNumber);
		}

		oRm.write("</span>");

		if (sStepTitle) {
			oRm.write("<span");
			oRm.writeAttribute("class", CLASSES.ANCHOR_TITLE);
			oRm.write(">");
			oRm.writeEscaped(sStepTitle);
			oRm.write("</span>");
		}

		oRm.write("</a>");
	};

	WizardProgressNavigatorRenderer.endStep = function (oRm) {
		oRm.write("</li>");
	};

	WizardProgressNavigatorRenderer.endList = function (oRm) {
		oRm.write("</ul>");
	};

	WizardProgressNavigatorRenderer.endNavigator = function (oRm) {
		oRm.write("</nav>");
	};

	return WizardProgressNavigatorRenderer;

}, /* bExport= */ true);
