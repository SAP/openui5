/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * @class Section renderer.
	 * @static
	 */
	var ObjectPageSectionRenderer = {};

	ObjectPageSectionRenderer.render = function (oRm, oControl) {
		var sTitle, bTitleVisible,
			bAccessibilityOn = sap.ui.getCore().getConfiguration().getAccessibility();

		if (!oControl.getVisible() || !oControl._getInternalVisible()) {
			return;
		}

		sTitle = oControl._getTitle();
		bTitleVisible = oControl._isTitleVisible();

		oRm.write("<section ");
		oRm.addClass("sapUxAPObjectPageSection");

		if (!bTitleVisible) {
			oRm.addClass("sapUxAPObjectPageSectionNoTitle");
		}

		oRm.writeClasses();
		oRm.writeAttribute("role", "region");

		if (bAccessibilityOn) {
			if (sTitle) {
				oRm.writeAttributeEscaped("aria-labelledby", oControl.getAggregation("ariaLabelledBy").getId());
			} else {
				oRm.writeAttribute("aria-label", sap.uxap.ObjectPageSection._getLibraryResourceBundle().getText("SECTION_CONTROL_NAME"));
			}
		}

		oRm.writeControlData(oControl);
		oRm.write(">");

		if (bTitleVisible) {
			oRm.write("<div");
			oRm.writeAttribute("role", "heading");
			oRm.writeAttribute("aria-level", oControl._getARIALevel());
			oRm.writeAttributeEscaped("id", oControl.getId() + "-header");
			oRm.addClass("sapUxAPObjectPageSectionHeader");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			oRm.writeAttributeEscaped("id", oControl.getId() + "-title");
			oRm.addClass("sapUxAPObjectPageSectionTitle");
			if (oControl.getTitleUppercase()) {
				oRm.addClass("sapUxAPObjectPageSectionTitleUppercase");
			}
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sTitle);
			oRm.write("</div>");
			oRm.renderControl(oControl._getShowHideAllButton());
			oRm.renderControl(oControl._getShowHideButton());
			oRm.write("</div>");
		}

		oRm.write("<div");
		oRm.addClass("sapUxAPObjectPageSectionContainer");
		oRm.writeClasses();
		if (oControl._isHidden){
			oRm.addStyle("display", "none");
		}
		oRm.writeStyles();
		oRm.write(">");

		oControl.getSubSections().forEach(oRm.renderControl);

		oRm.write("</div>");

		oRm.write("</section>");
	};

	return ObjectPageSectionRenderer;

}, /* bExport= */ true);
