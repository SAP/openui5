/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	var CLASSES = {
		NAVIGATION: "sapMWizardProgressNav",
		LIST: "sapMWizardProgressNavList",
		LIST_VARYING: "sapMWizardProgressNavListVarying",
		LIST_NO_TITLES: "sapMWizardProgressNavListNoTitles",
		STEP: "sapMWizardProgressNavStep",
		ANCHOR: "sapMWizardProgressNavAnchor",
		ANCHOR_CIRCLE: "sapMWizardProgressNavAnchorCircle",
		ANCHOR_TITLE: "sapMWizardProgressNavAnchorTitle",
		ANCHOR_TITLE_OPTIONAL_TITLE: "sapMWizardProgressNavAnchorTitleOptional",
		ANCHOR_TITLE_OPTIONAL_LABEL: "sapMWizardProgressNavAnchorLabelOptional",
		ANCHOR_ICON: "sapMWizardProgressNavAnchorIcon",
		ANCHOR_TITLE_CONTAINER: "sapMWizardProgressNavAnchorTitleContainer"
	};

	var ATTRIBUTES = {
		STEP: "data-sap-ui-wpn-step",
		STEP_COUNT: "data-sap-ui-wpn-step-count",
		CURRENT_STEP: "data-sap-ui-wpn-step-current",
		ACTIVE_STEP: "data-sap-ui-wpn-step-active",
		OPEN_STEP: "data-sap-ui-wpn-step-open",
		OPEN_STEP_PREV: "data-sap-ui-wpn-step-open-prev",
		OPEN_STEP_NEXT: "data-sap-ui-wpn-step-open-next",
		ARIA_LABEL: "aria-label",
		ARIA_DISABLED: "aria-disabled"
	};

	var WizardProgressNavigatorRenderer = {
			CLASSES: CLASSES,
			ATTRIBUTES: ATTRIBUTES
		},
		oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	WizardProgressNavigatorRenderer.render = function (oRm, oControl) {
		this.startNavigator(oRm, oControl);

		this.renderList(oRm, oControl);

		this.endNavigator(oRm);
	};

	WizardProgressNavigatorRenderer.startNavigator = function (oRm, oControl) {
		var sWizardLabelText = oResourceBundle.getText("WIZARD_LABEL");

		oRm.write("<nav");
		oRm.writeControlData(oControl);
		oRm.addClass(CLASSES.NAVIGATION + " sapContrastPlus");
		oRm.writeClasses();
		oRm.writeAttribute(ATTRIBUTES.STEP_COUNT, oControl.getStepCount());
		oRm.writeAccessibilityState({
			"role": "navigation",
			"label": sWizardLabelText
		});
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

		oRm.writeAccessibilityState({
			"role": "list"
		});

		oRm.writeClasses();
		oRm.write(">");
	};

	WizardProgressNavigatorRenderer.renderSteps = function (oRm, oControl) {
		var iStepCount = oControl.getStepCount(),
			aStepTitles = oControl.getStepTitles(),
			aStepOptionalIndication = oControl._aStepOptionalIndication,
			aStepIcons = oControl.getStepIcons(),
			sOptionalLabel = oResourceBundle.getText("WIZARD_STEP_OPTIONAL_STEP_TEXT");

		for (var i = 1; i <= iStepCount; i++) {
			var sLabel = aStepOptionalIndication[i - 1] ? sOptionalLabel : "";
			this.startStep(oRm, i);
			this.renderAnchor(oRm, oControl, i, aStepTitles[i - 1], aStepIcons[i - 1], sLabel);
			this.endStep(oRm);
		}
	};

	WizardProgressNavigatorRenderer.startStep = function (oRm, iStepNumber) {
		oRm.write("<li");
		oRm.writeAttribute("class", CLASSES.STEP);
		oRm.writeAttribute(ATTRIBUTES.STEP, iStepNumber);

		oRm.writeAccessibilityState({
			"role": "listitem"
		});

		oRm.write(">");
	};

	WizardProgressNavigatorRenderer.renderAnchor = function (oRm, oControl, iStepNumber, sStepTitle, sIconUri, sOptionalLabel) {
		var aSteps = oControl._aCachedSteps,
			oCurrentStep = aSteps[iStepNumber];

		// write link opening tag
		oRm.write("<a tabindex='-1' ");

		// write attributes for the link
		if (!oCurrentStep || !!parseInt(oCurrentStep.style.zIndex)) {
			oRm.write("aria-disabled='true'");
		}
		oRm.writeAttribute("class", CLASSES.ANCHOR);
		this.writeAnchorTooltip(oRm, sStepTitle, sOptionalLabel, iStepNumber);

		// close link opening tag
		oRm.write(">");

		// render anchor circle
		this.renderAnchorCircle(oRm, sIconUri, iStepNumber);

		// render step title
		if (sStepTitle) {
			this.renderAnchorTitle(oRm, sStepTitle, sOptionalLabel);
		}

		// close link
		oRm.write("</a>");
	};

	WizardProgressNavigatorRenderer.renderAnchorCircle = function (oRm, sIconUri, iStepNumber) {
		oRm.write("<span");
		oRm.writeAttribute("class", CLASSES.ANCHOR_CIRCLE);
		oRm.write(">");

		if (sIconUri) {
			oRm.writeIcon(sIconUri, [CLASSES.ANCHOR_ICON], {title: null});
		} else {
			oRm.write(iStepNumber);
		}

		oRm.write("</span>");
	};

	WizardProgressNavigatorRenderer.writeAnchorTooltip = function (oRm, sStepTitle, sOptionalLabel, iStepNumber) {
		var sStepText = oResourceBundle.getText("WIZARD_PROG_NAV_STEP_TITLE"),
			sTitleAttribute;

		if (sStepTitle) {
			sTitleAttribute = iStepNumber + ". " + sStepTitle;
		} else {
			sTitleAttribute = sStepText + " " + iStepNumber;
		}

		// add optional label
		if (sOptionalLabel) {
			sTitleAttribute += " (" + sOptionalLabel + ")";
		}

		oRm.writeAttributeEscaped("title", sTitleAttribute);
	};

	WizardProgressNavigatorRenderer.renderAnchorTitle = function (oRm, sStepTitle, sOptionalLabel) {
		oRm.write("<span");
		oRm.writeAttribute("class", CLASSES.ANCHOR_TITLE_CONTAINER);
		oRm.write(">");

		oRm.write("<span");
		oRm.addClass(CLASSES.ANCHOR_TITLE);
		if (sOptionalLabel) {
			oRm.addClass(CLASSES.ANCHOR_TITLE_OPTIONAL_TITLE);
		}
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sStepTitle);
		oRm.write("</span>");

		if (sOptionalLabel) {
			oRm.write("<span");
			oRm.writeAttribute("class", CLASSES.ANCHOR_TITLE_OPTIONAL_LABEL);
			oRm.write(">");
			oRm.writeEscaped("(" + sOptionalLabel + ")");
			oRm.write("</span>");
		}

		oRm.write("</span>");
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
