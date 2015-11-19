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

		if (!oControl.getVisible() || !oControl._getInternalVisible()) {
			return;
		}
		var sTitle = oControl._getInternalTitle() ? oControl._getInternalTitle() : oControl.getTitle();

		oRm.write("<section ");
		oRm.addClass("sapUxAPObjectPageSection");
		oRm.writeClasses();
		oRm.writeAttribute("role", "region");
		oRm.writeAttributeEscaped("aria-labelledby", oControl.getAggregation("ariaLabelledBy").getId());
		oRm.writeControlData(oControl);
		oRm.write(">");

		if (oControl.getShowTitle() && oControl._getInternalTitleVisible()) {
			oRm.write("<div");
			oRm.writeAttribute("role", "heading");
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
		oRm.write(">");

		oControl.getSubSections().forEach(oRm.renderControl);

		oRm.write("</div>");

		oRm.write("</section>");
	};

	return ObjectPageSectionRenderer;

}, /* bExport= */ true);
