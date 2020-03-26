/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * @class Section renderer.
	 * @static
	 */
	var ObjectPageSubSectionRenderer = {
		apiVersion: 2
	};

	ObjectPageSubSectionRenderer.render = function (oRm, oControl) {
		var aActions, bHasTitle, bShowTitle, bHasTitleLine, bHasActions, bUseTitleOnTheLeft, bHasVisibleActions,
			bAccessibilityOn = sap.ui.getCore().getConfiguration().getAccessibility();

		if (!oControl.getVisible() || !oControl._getInternalVisible()) {
			return;
		}

		aActions = oControl.getActions() || [];
		bHasActions = aActions.length > 0;
		bShowTitle = oControl.getShowTitle();
		bHasTitle = (oControl._getInternalTitleVisible() && (oControl.getTitle().trim() !== "")) && bShowTitle;
		bHasTitleLine = bHasTitle || bHasActions;
		bHasVisibleActions = oControl._hasVisibleActions();

		oRm.openStart("div", oControl)
			.attr("role", "region")
			.style("height", oControl._getHeight());

		if (oControl._bBlockHasMore) {
			oRm.class("sapUxAPObjectPageSubSectionWithSeeMore");
		}

		oRm.class("sapUxAPObjectPageSubSection")
			.class("ui-helper-clearfix");


		if (bAccessibilityOn) {
			if (bHasTitle) {
				oRm.attr("aria-labelledby", oControl.getId() + "-headerTitle");
			} else {
				oRm.attr("aria-label", sap.uxap.ObjectPageSubSection._getLibraryResourceBundle().getText("SUBSECTION_CONTROL_NAME"));
			}
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

			oRm.openStart("div", oControl.getId() + "-headerTitle");

			if (bHasTitle) {
				oRm.attr("role", "heading")
					.attr("aria-level",  oControl._getARIALevel());
			}

			oRm.class('sapUxAPObjectPageSubSectionHeaderTitle');

			if (oControl.getTitleUppercase()) {
				oRm.class("sapUxAPObjectPageSubSectionHeaderTitleUppercase");
			}

			oRm.attr("data-sap-ui-customfastnavgroup", true)
				.openEnd();

			if (bHasTitle) {
				oRm.text(oControl.getTitle());
			}

			oRm.close("div");

			if (bHasActions) {
				oRm.openStart("div")
					.class('sapUxAPObjectPageSubSectionHeaderActions')
					.attr("data-sap-ui-customfastnavgroup", true)
					.openEnd();
				aActions.forEach(oRm.renderControl, oRm);
				oRm.close("div");
			}

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
