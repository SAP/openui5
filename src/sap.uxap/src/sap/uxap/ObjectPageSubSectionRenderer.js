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
		var aActions, bHasTitle, bHasTitleLine, bHasActions, bUseTitleOnTheLeft;

		if (!oControl.getVisible() || !oControl._getInternalVisible()) {
			return;
		}

		aActions = oControl.getActions() || [];
		bHasActions = aActions.length > 0;
		bHasTitle = (oControl._getInternalTitleVisible() && (oControl.getTitle().trim() !== ""));
		bHasTitleLine = bHasTitle || bHasActions;

		oRm.write("<div ");
		oRm.writeAttribute("role", "region");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUxAPObjectPageSubSection");
		oRm.writeClasses(oControl);
		oRm.writeClasses();
		oRm.write(">");

		if (bHasTitleLine) {
			oRm.write("<div");
			oRm.addClass("sapUxAPObjectPageSubSectionHeader");

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
				oRm.writeAttribute("aria-level", "4");
			}
			oRm.addClass('sapUxAPObjectPageSubSectionHeaderTitle');
			if (oControl.getTitleUppercase()) {
				oRm.addClass("sapUxAPObjectPageSubSectionHeaderTitleUppercase");
			}
			oRm.writeAttributeEscaped("id", oControl.getId() + "-headerTitle");
			oRm.writeClasses();
			oRm.writeAttribute("data-sap-ui-customfastnavgroup", true);
			if (bHasTitle) {
				oRm.writeAttribute("tabindex", 0);
			}
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
		oRm.addClass("sapUiResponsiveMargin");
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
