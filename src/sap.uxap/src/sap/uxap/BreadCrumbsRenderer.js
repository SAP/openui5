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
		oRm.openStart("div", oControl)
			.class("sapUxAPBreadCrumbs")
			.attr("role", "navigation")
			.attr("aria-labelledby", oControl._getAriaLabelledBy().getId())
			.openEnd();

		this._renderOverflowSelect(oRm, oControl);

		if (!oControl._bOnPhone) {
			this._renderBreadcrumbTrail(oRm, oControl);
		}

		oRm.close("div");
	};

	BreadCrumbsRenderer._renderBreadcrumbTrail = function (oRm, oControl) {
		var aLinks = oControl.getLinks(),
			oCurrentLocation = oControl.getCurrentLocation(),
			oTubeIcon = oControl._getTubeIcon(),
			bShowCurrentLocation = oControl.getShowCurrentLocation();

		oRm.openStart("ul", oControl.getId() + "-breadcrumbs")
			.openEnd();

		aLinks.forEach(function (oLink) {
			oRm.openStart("li")
				.openEnd();
			oRm.renderControl(oLink);
			oRm.renderControl(oTubeIcon);
			oRm.close("li");
		});
		if (bShowCurrentLocation) {
			oRm.openStart("li")
				.openEnd();
			oRm.renderControl(oCurrentLocation);
			oRm.close("li");
		}
		oRm.close("ul");
	};

	BreadCrumbsRenderer._renderOverflowSelect = function (oRm, oControl) {
		var oTubeIcon = oControl._getTubeIcon();

		oRm.openStart("div", oControl.getId() + "-select");
		oRm.class("sapUiHidden");
		oRm.openEnd();
		oRm.openStart("span")
			.class("sapUxAPBreadCrumbsDots")
			.openEnd()
			.text("...")
			.close("span");
		oRm.renderControl(oTubeIcon);
		oRm.renderControl(oControl._getOverflowSelect());
		oRm.close("div");
	};

	return BreadCrumbsRenderer;

}, /* bExport= */ true);
