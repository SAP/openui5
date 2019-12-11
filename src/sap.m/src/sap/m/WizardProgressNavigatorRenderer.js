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
			apiVersion: 2,
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

		oRm.openStart("nav", oControl)
			.class(CLASSES.NAVIGATION)
			.class("sapContrastPlus")
			.attr(ATTRIBUTES.STEP_COUNT, oControl.getStepCount())
			.accessibilityState({
				role: "navigation",
				label: sWizardLabelText
			})
			.openEnd();
	};

	WizardProgressNavigatorRenderer.renderList = function (oRm, oControl) {
		this.startList(oRm, oControl);
		this.renderSteps(oRm, oControl);
		this.endList(oRm);
	};

	WizardProgressNavigatorRenderer.startList = function (oRm, oControl) {
		var aStepTitles = oControl.getStepTitles();

		oRm.openStart("ul");
		if (oControl.getVaryingStepCount()) {
			oRm.class(CLASSES.LIST_VARYING);
		} else {
			oRm.class(CLASSES.LIST);
		}

		if (!aStepTitles.length) {
			oRm.class(CLASSES.LIST_NO_TITLES);
		}

		oRm.accessibilityState({
			role: "list"
		});

		oRm.openEnd();
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
		oRm.openStart("li")
			.class(CLASSES.STEP)
			.attr(ATTRIBUTES.STEP, iStepNumber)
			.accessibilityState({
				role: "listitem"
			})
			.openEnd();
	};

	WizardProgressNavigatorRenderer.renderAnchor = function (oRm, oControl, iStepNumber, sStepTitle, sIconUri, sOptionalLabel) {
		var aSteps = oControl._aCachedSteps,
			oCurrentStep = aSteps[iStepNumber];

		// write link opening tag
		oRm.openStart("a").attr("tabindex", "-1");

		// write attributes for the link
		if (!oCurrentStep || !!parseInt(oCurrentStep.style.zIndex)) {
			oRm.attr("aria-disabled", "true");
		}
		oRm.class(CLASSES.ANCHOR);
		this.writeAnchorTooltip(oRm, sStepTitle, sOptionalLabel, iStepNumber);

		// close link opening tag
		oRm.openEnd();

		// render anchor circle
		this.renderAnchorCircle(oRm, sIconUri, iStepNumber);

		// render step title
		if (sStepTitle) {
			this.renderAnchorTitle(oRm, sStepTitle, sOptionalLabel);
		}

		// close link
		oRm.close("a");
	};

	WizardProgressNavigatorRenderer.renderAnchorCircle = function (oRm, sIconUri, iStepNumber) {
		oRm.openStart("span")
			.class(CLASSES.ANCHOR_CIRCLE)
			.openEnd();

		if (sIconUri) {
			oRm.icon(sIconUri, [CLASSES.ANCHOR_ICON], {title: null});
		} else {
			oRm.text(iStepNumber);
		}

		oRm.close("span");
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

		oRm.attr("title", sTitleAttribute);
	};

	WizardProgressNavigatorRenderer.renderAnchorTitle = function (oRm, sStepTitle, sOptionalLabel) {
		oRm.openStart("span")
			.class(CLASSES.ANCHOR_TITLE_CONTAINER)
			.openEnd();

		oRm.openStart("span")
			.class(CLASSES.ANCHOR_TITLE);
		if (sOptionalLabel) {
			oRm.class(CLASSES.ANCHOR_TITLE_OPTIONAL_TITLE);
		}
		oRm.openEnd()
			.text(sStepTitle)
			.close("span");

		if (sOptionalLabel) {
			oRm.openStart("span")
				.class(CLASSES.ANCHOR_TITLE_OPTIONAL_LABEL)
				.openEnd(">")
				.text("(" + sOptionalLabel + ")")
				.close("span");
		}

		oRm.close("span");
	};

	WizardProgressNavigatorRenderer.endStep = function (oRm) {
		oRm.close("li");
	};

	WizardProgressNavigatorRenderer.endList = function (oRm) {
		oRm.close("ul");
	};

	WizardProgressNavigatorRenderer.endNavigator = function (oRm) {
		oRm.close("nav");
	};

	return WizardProgressNavigatorRenderer;

}, /* bExport= */ true);
