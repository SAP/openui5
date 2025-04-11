/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/ControlBehavior"], function (ControlBehavior) {
	"use strict";

	/**
	 * Section renderer.
	 * @namespace
	 */
	var ObjectPageSectionRenderer = {
		apiVersion: 2
	};

	ObjectPageSectionRenderer.render = function (oRm, oControl) {
		var bTitleVisible, bTitleAriaHidden, bShouldDisplayButtonsInHeader, bHasMoreThanOneVisibleSubSection,
			bAccessibilityOn = ControlBehavior.isAccessibilityEnabled(),
			oLabelledByTitleID = oControl._getAriaLabelledById(),
			oHeading = oControl.getHeading(),
			bWrapTitle = oControl.getWrapTitle();

		if (!oControl.getVisible() || !oControl._getInternalVisible()) {
			return;
		}

		bTitleVisible = oControl.getTitleVisible();
		bTitleAriaHidden = !oControl._isTitleAriaVisible();
		bShouldDisplayButtonsInHeader = oControl._shouldDisplayButtonsInHeader();
		bHasMoreThanOneVisibleSubSection = oControl._getVisibleSubSections().length > 1;

		oRm.openStart("section", oControl)
			.class("sapUxAPObjectPageSection");

		if (bTitleAriaHidden) {
			oRm.class("sapUxAPObjectPageSectionNoTitle");
		}

		if (bWrapTitle) {
			oRm.class("sapUxAPObjectPageSectionWrapTitle");
		}

		oRm.attr("role", "region");

		if (bAccessibilityOn && oLabelledByTitleID) {
			oRm.attr("aria-labelledby", oLabelledByTitleID);
		}

		oRm.attr("data-sap-ui-customfastnavgroup", true);

		oRm.openEnd();

		if (oHeading) {
			oRm.openStart("div")
				.class("sapUxAPObjectPageSectionHeading")
				.openEnd();
				oRm.renderControl(oHeading);
			oRm.close("div");
		}

		oRm.openStart("div", oControl.getId() + "-header")
			.attr("role", "heading")
			.attr("aria-level", oControl._getARIALevel())
			.class("sapUxAPObjectPageSectionHeader")
			.class(bTitleAriaHidden ? "sapUxAPObjectPageSectionHeaderHidden" : "")
			.class(bHasMoreThanOneVisibleSubSection && !bShouldDisplayButtonsInHeader ? "sapUxAPObjectPageSectionHeaderCompact" : "");

		if (bTitleAriaHidden) {
			oRm.attr("aria-hidden", "true");
		}

		oRm.openEnd();

		if (bTitleVisible) {
			oRm.renderControl(oControl._getTitleControl());
			oRm.renderControl(oControl._getShowHideAllButton());
			oRm.renderControl(oControl._getShowHideButton());
		}
		oRm.close("div");


		oRm.openStart("div")
			.class("sapUxAPObjectPageSectionContainer");

		if (oControl._isHidden){
			oRm.style("display", "none");
		}

		oRm.openEnd();

		oRm.renderControl(oControl._getGrid());

		oRm.close("div");

		oRm.close("section");
	};

	return ObjectPageSectionRenderer;

}, /* bExport= */ true);
