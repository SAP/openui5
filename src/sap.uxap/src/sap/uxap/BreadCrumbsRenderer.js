/*!
 * ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * @class BreadCrumbs renderer.
	 * @static
	 */
	var BreadCrumbsRenderer = {};

	BreadCrumbsRenderer.render = function (oRm, oControl) {
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapUxAPBreadCrumbs");
		oRm.writeClasses();
		oRm.writeAttribute("role", "navigation");
		oRm.writeAttributeEscaped("aria-labelledby", oControl._getAriaLabelledBy().getId());
		oRm.write(">");

		this._renderOverflowSelect(oRm, oControl);

		if (!oControl._bOnPhone) {
			this._renderBreadcrumbTrail(oRm, oControl);
		}

		oRm.write("</div>");
	};

	BreadCrumbsRenderer._renderBreadcrumbTrail = function (oRm, oControl) {
		var aLinks = oControl.getLinks(),
			oCurrentLocation = oControl.getCurrentLocation(),
			oTubeIcon = oControl._getTubeIcon(),
			bShowCurrentLocation = oControl.getShowCurrentLocation();

		oRm.write("<ul id='" + oControl.getId() + "-breadcrumbs'");
		oRm.write(">");
		aLinks.forEach(function (oLink) {
			oRm.write("<li>");
			oRm.renderControl(oLink);
			oRm.renderControl(oTubeIcon);
			oRm.write("</li>");
		});
		if (bShowCurrentLocation) {
			oRm.write("<li>");
			oRm.renderControl(oCurrentLocation);
			oRm.write("</li>");
		}
		oRm.write("</ul>");
	};

	BreadCrumbsRenderer._renderOverflowSelect = function (oRm, oControl) {
		var oTubeIcon = oControl._getTubeIcon();

		oRm.write("<div id='" + oControl.getId() + "-select'");
		oRm.addClass("sapUiHidden");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write('<span class="sapUxAPBreadCrumbsDots">...</span>');
		oRm.renderControl(oTubeIcon);
		oRm.renderControl(oControl._getOverflowSelect());
		oRm.write("</div>");
	};

	return BreadCrumbsRenderer;

}, /* bExport= */ true);
