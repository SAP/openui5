/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/ControlBehavior"], function (ControlBehavior) {
	"use strict";

	/**
	 * SubSection renderer.
	 * @namespace
	 */
	var ObjectPageSubSectionRenderer = {
		apiVersion: 2
	};

	ObjectPageSubSectionRenderer.render = function (oRm, oControl) {
		var aActions, bHasTitle, bHasTitleLine, bUseTitleOnTheLeft, bHasActions, bHasVisibleActions,
			bAccessibilityOn = ControlBehavior.isAccessibilityEnabled(),
			oLabelledByTitleID = oControl._getAriaLabelledById();

		if (!oControl.getVisible() || !oControl._getInternalVisible()) {
			return;
		}

		aActions = oControl._getHeaderToolbar().getContent() || [];
		bHasActions = aActions.length > 2;
		bHasVisibleActions = oControl._hasVisibleActions();
		bHasTitle = oControl._isTitleVisible();
		bHasTitleLine = bHasTitle || bHasActions;

		oRm.openStart("div", oControl)
		.style("height", oControl._getHeight());

		if (bHasTitle) {
			oRm.attr("role", "region");
		}

		if (oControl._bBlockHasMore) {
			oRm.class("sapUxAPObjectPageSubSectionWithSeeMore");
		}

		oRm.class("sapUxAPObjectPageSubSection")
			.class("ui-helper-clearfix");


		if (bAccessibilityOn && oLabelledByTitleID && oControl.getTitleVisible()) {
			oRm.attr("aria-labelledby", oLabelledByTitleID);
		}

		oRm.openEnd();

		if (bHasTitleLine) {
			oRm.openStart("div", oControl.getId() + "-header")
				.class("sapUxAPObjectPageSubSectionHeader");

			if (!bHasTitle && !bHasVisibleActions) {
				oRm.class("sapUiHidden");
			}

			bUseTitleOnTheLeft = oControl._getUseTitleOnTheLeft();
			if (bUseTitleOnTheLeft) {
				oRm.class("titleOnLeftLayout");
			}

			oRm.openEnd();

			oRm.renderControl(oControl._getHeaderToolbar());
			oRm.renderControl(oControl._getShowHideButton());

			oRm.close("div");
		}

		oRm.openStart("div")
			.class("ui-helper-clearfix")
			.class("sapUxAPBlockContainer");

		if (oControl._isHidden){
			oRm.style("display", "none");
		}

		oRm.openEnd();

		oRm.renderControl(oControl._getGrid());

		oRm.close("div");

		oRm.openStart("div")
			.class("sapUxAPSubSectionSeeMoreContainer");

		if (oControl._isHidden){
			oRm.style("display", "none");
		}

		oRm.openEnd();

		oRm.renderControl(oControl._getSeeMoreButton());
		oRm.renderControl(oControl._getSeeLessButton());
		oRm.close("div");

		oRm.close("div");
	};


	return ObjectPageSubSectionRenderer;

}, /* bExport= */ true);
