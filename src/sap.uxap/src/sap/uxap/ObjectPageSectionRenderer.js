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
			bAccessibilityOn = sap.ui.getCore().getConfiguration().getAccessibility(),
			oLabelledBy = oControl.getAggregation("ariaLabelledBy");

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

		if (bAccessibilityOn && oLabelledBy) {
			oRm.writeAttribute("aria-labelledby", oLabelledBy.getId());
		}

		oRm.writeControlData(oControl);
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttribute("role", "heading");
		oRm.writeAttribute("aria-level", oControl._getARIALevel());
		oRm.writeAttributeEscaped("id", oControl.getId() + "-header");
		oRm.addClass("sapUxAPObjectPageSectionHeader");

		oRm.addClass(bTitleVisible ? "" : "sapUxAPObjectPageSectionHeaderHidden");

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

		if (bTitleVisible) {
			oRm.renderControl(oControl._getShowHideAllButton());
			oRm.renderControl(oControl._getShowHideButton());
		}

		oRm.write("</div>");

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
