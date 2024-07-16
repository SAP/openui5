/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/InvisibleText",
	"sap/ui/core/IconPool", // side effect: required when calling RenderManager#icon
	"sap/ui/core/Lib"
], function(
	InvisibleText,
	_IconPool,
	Library
) {
	"use strict";

	var CLASSES = {
		NAVIGATION: "sapMWizardProgressNav",
		LIST: "sapMWizardProgressNavList",
		LIST_VARYING: "sapMWizardProgressNavListVarying",
		LIST_NO_TITLES: "sapMWizardProgressNavListNoTitles",
		STEP: "sapMWizardProgressNavStep",
		STEP_CIRCLE: "sapMWizardProgressNavStepCircle",
		STEP_TITLE: "sapMWizardProgressNavStepTitle",
		STEP_TITLE_OPTIONAL_TITLE: "sapMWizardProgressNavStepTitleOptional",
		STEP_TITLE_OPTIONAL_LABEL: "sapMWizardProgressNavStepLabelOptional",
		STEP_ICON: "sapMWizardProgressNavStepIcon",
		STEP_TITLE_CONTAINER: "sapMWizardProgressNavStepTitleContainer"
	};

	var ATTRIBUTES = {
		STEP: "data-sap-ui-wpn-step",
		STEP_COUNT: "data-sap-ui-wpn-step-count",
		CURRENT_STEP: "data-sap-ui-wpn-step-current",
		ACTIVE_STEP: "data-sap-ui-wpn-step-active",
		OPEN_STEP: "data-sap-ui-wpn-step-open",
		OPEN_STEP_PREV: "data-sap-ui-wpn-step-open-prev",
		OPEN_STEP_NEXT: "data-sap-ui-wpn-step-open-next",
		ARIA_CURRENT: "aria-current",
		ARIA_LABEL: "aria-label",
		ARIA_HASPOPUP: "aria-haspopup",
		ARIA_DESCRIBEDBY: "aria-describedby"
	};

	var WizardProgressNavigatorRenderer = {
			apiVersion: 2,
			CLASSES: CLASSES,
			ATTRIBUTES: ATTRIBUTES
		},
		oResourceBundle = Library.getResourceBundleFor("sap.m");

	WizardProgressNavigatorRenderer.render = function (oRm, oControl) {
		this.startNavigator(oRm, oControl);

		this.renderList(oRm, oControl);

		this.endNavigator(oRm);
	};

	WizardProgressNavigatorRenderer.startNavigator = function (oRm, oControl) {
		var sWizardAriaLabelText = oResourceBundle.getText("WIZARD_PROGRESS_NAVIGATOR_ARIA_LABEL");

		oRm.openStart("nav", oControl)
			.class(CLASSES.NAVIGATION)
			.class("sapContrastPlus")
			.attr(ATTRIBUTES.STEP_COUNT, oControl.getStepCount())
			.accessibilityState({
				label: sWizardAriaLabelText
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
		var sWizardAriaLabelText = oResourceBundle.getText("WIZARD_PROGRESS_NAVIGATOR_LIST_ARIA_LABEL");

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
			role: "list",
			label: sWizardAriaLabelText,
			controls: oControl.getParent().sId + "-step-container",
			describedby: InvisibleText.getStaticId("sap.m", "WIZARD_PROGRESS_NAVIGATOR_LIST_ARIA_DESCRIBEDBY")
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
			this.startStep(oRm, oControl, i, aStepTitles[i - 1], aStepIcons[i - 1], sLabel);
			this.endStep(oRm);
		}
	};

	WizardProgressNavigatorRenderer.startStep = function (oRm, oControl, iStepNumber, sStepTitle, sIconUri, sOptionalLabel) {
		var bCurrentStepActive = oControl._isActiveStep(iStepNumber);
		var sStepActive = bCurrentStepActive ? "ACTIVE" : "INACTIVE";
		var sValueText = oResourceBundle.getText("WIZARD_STEP_" + sStepActive + "_LABEL", [iStepNumber, sStepTitle, sOptionalLabel]);
		var mACCOptions = {
			role: "listitem",
			label: sValueText
		};
		const sStepId = oControl.getId() + "-step-" + oControl._aStepIds[iStepNumber - 1];

		oRm.openStart("li", sStepId )
			.class(CLASSES.STEP)
			.attr(ATTRIBUTES.STEP, iStepNumber)
			.attr("tabindex", "-1")
			.accessibilityState(mACCOptions);

		oRm.attr("aria-posinset", iStepNumber);

		if (!oControl.getVaryingStepCount()) {
			oRm.attr("aria-setsize", oControl.getStepCount());
		} else {
			oRm.attr("aria-setsize", "-1");
		}

		oRm.openEnd();

		oRm.openStart("div").class("sapMWizardProgressNavStepContainer");
		oRm.openEnd();

		// render step circle
		this.renderStepCircle(oRm, sIconUri, iStepNumber);

		// render step title
		if (sStepTitle) {
			this.renderStepTitle(oRm, sStepTitle, sOptionalLabel);
		}

		oRm.close("div");
	};

	WizardProgressNavigatorRenderer.renderStepCircle = function (oRm, sIconUri, iStepNumber) {
		oRm.openStart("span")
			.class(CLASSES.STEP_CIRCLE)
			.openEnd();

		if (sIconUri) {
			oRm.icon(sIconUri, [CLASSES.STEP_ICON], {title: null});
		} else {
			oRm.text(iStepNumber);
		}

		oRm.close("span");
	};

	WizardProgressNavigatorRenderer.renderStepTitle = function (oRm, sStepTitle, sOptionalLabel) {
		oRm.openStart("span")
			.class(CLASSES.STEP_TITLE_CONTAINER)
			.openEnd();

		oRm.openStart("span")
			.class(CLASSES.STEP_TITLE);
		if (sOptionalLabel) {
			oRm.class(CLASSES.STEP_TITLE_OPTIONAL_TITLE);
		}
		oRm.openEnd()
			.text(sStepTitle)
			.close("span");

		if (sOptionalLabel) {
			oRm.openStart("span")
				.class(CLASSES.STEP_TITLE_OPTIONAL_LABEL)
				.openEnd()
				.text(sOptionalLabel)
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

});
