/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * @class Section renderer.
	 * @static
	 */
	var ObjectPageSubSectionRenderer = {};

	ObjectPageSubSectionRenderer.render = function (oRm, oControl) {
		var aActions, bHasTitle, bHasTitleLine, bHasActions, bUseTitleOnTheLeft, bHasVisibleActions,
			bAccessibilityOn = sap.ui.getCore().getConfiguration().getAccessibility();

		if (!oControl.getVisible() || !oControl._getInternalVisible()) {
			return;
		}

		aActions = oControl.getActions() || [];
		bHasActions = aActions.length > 0;
		bHasTitle = (oControl._getInternalTitleVisible() && (oControl.getTitle().trim() !== ""));
		bHasTitleLine = bHasTitle || bHasActions;
		bHasVisibleActions = oControl._hasVisibleActions();

		oRm.write("<div ");
		oRm.writeAttribute("role", "region");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUxAPObjectPageSubSection");
		oRm.addClass("ui-helper-clearfix");
		oRm.writeClasses(oControl);
		oRm.writeClasses();

		if (bAccessibilityOn) {
			if (bHasTitle) {
				oRm.writeAttributeEscaped("aria-labelledby", oControl.getId() + "-headerTitle");
			} else {
				oRm.writeAttribute("aria-label", sap.uxap.ObjectPageSubSection._getLibraryResourceBundle().getText("SUBSECTION_CONTROL_NAME"));
			}
		}

		oRm.write(">");

		if (bHasTitleLine) {
			oRm.write("<div");
			oRm.addClass("sapUxAPObjectPageSubSectionHeader");

			if (!bHasTitle && !bHasVisibleActions) {
				oRm.addClass("sapUiHidden");
			}

			bUseTitleOnTheLeft = oControl._getUseTitleOnTheLeft();
			if (bUseTitleOnTheLeft && oControl._onDesktopMediaRange()) {
				oRm.addClass("titleOnLeftLayout");
			}
			oRm.writeAttributeEscaped("id", oControl.getId() + "-header");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			if (bHasTitle) {
				oRm.writeAttribute("role", "heading");
				oRm.writeAttribute("aria-level",  oControl._getARIALevel());
			}
			oRm.addClass('sapUxAPObjectPageSubSectionHeaderTitle');
			if (oControl.getTitleUppercase()) {
				oRm.addClass("sapUxAPObjectPageSubSectionHeaderTitleUppercase");
			}
			oRm.writeAttributeEscaped("id", oControl.getId() + "-headerTitle");
			oRm.writeClasses();
			oRm.writeAttribute("data-sap-ui-customfastnavgroup", true);
			oRm.write(">");
			if (bHasTitle) {
				oRm.writeEscaped(oControl.getTitle());
			}
			oRm.write("</div>");

			if (bHasActions) {
				oRm.write("<div");
				oRm.addClass('sapUxAPObjectPageSubSectionHeaderActions');
				oRm.writeClasses();
				oRm.writeAttribute("data-sap-ui-customfastnavgroup", true);
				oRm.write(">");
				aActions.forEach(oRm.renderControl);
				oRm.write("</div>");
			}

			oRm.write("</div>");
		}

		oRm.write("<div");
		oRm.addClass("ui-helper-clearfix");
		oRm.addClass("sapUxAPBlockContainer");
		oRm.addClass("sapUxAPBlockContainer" + oControl._getMediaString());
		oRm.writeClasses();
		if (oControl._isHidden){
			oRm.addStyle("display", "none");
		}
		oRm.writeStyles();
		oRm.write(">");

		oRm.renderControl(oControl._getGrid());

		oRm.write("<div");
		oRm.addClass("sapUxAPSubSectionSeeMoreContainer");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl._getSeeMoreButton());
		oRm.write("</div>");
		oRm.write("</div>");
		oRm.write("</div>");
	};


	return ObjectPageSubSectionRenderer;

}, /* bExport= */ true);
