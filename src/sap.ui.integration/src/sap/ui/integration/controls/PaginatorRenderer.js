/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/base/strings/capitalize",
	"sap/ui/core/InvisibleRenderer"
], function(mLibrary, Core, capitalize, InvisibleRenderer) {
	"use strict";

	var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

	var _BULLETS_TO_NUMBERS_THRESHOLD = 5;

	/**
	 * PaginatorRenderer renderer.
	 * @namespace
	 */
	var PaginatorRenderer = {
		apiVersion: 2
	};

	PaginatorRenderer.render = function (oRm, oControl) {
		var sId = oControl.getId(),
			iPageNumber = oControl.getPageNumber(),
			iPageCount = oControl.getPageCount(),
			i,
			sTextBetweenNumbers;

		// If there is only one page - do not render the indicator
		if (iPageCount <= 1 || !oControl.getVisible()) {
			InvisibleRenderer.render(oRm, oControl, oControl.TagName);
			return;
		}

		oRm.openStart("div", oControl)
			.class("sapUiIntPaginator")
			.openEnd();

		oRm.openStart("div")
			.class("sapMCrslControls")
			.openEnd();

		oRm.openStart("div")
			.class("sapMCrslControlsContainer")
			.openEnd();

		this._renderArrow(oRm, oControl, "previous");

		oRm.openStart("div", sId + "-pageIndicator");

		if (iPageCount < _BULLETS_TO_NUMBERS_THRESHOLD) {
			oRm.class("sapMCrslBulleted")
				.openEnd();

			for (i = 0; i < iPageCount; i++) {
				oRm.openStart("span")
					.accessibilityState({
						role: "img",
						label: oResourceBundle.getText("CAROUSEL_POSITION", [i + 1, iPageCount])
					});

				oRm.attr("data-slide", i + 1);

				if (i === iPageNumber) {
					oRm.class("sapMCrslActive");
				}

				oRm.openEnd()

					.close("span");
			}
		} else {
			oRm.class("sapMCrslNumeric")
				.openEnd();

			sTextBetweenNumbers = oResourceBundle.getText("CAROUSEL_PAGE_INDICATOR_TEXT", [iPageNumber + 1, iPageCount]);
			oRm.openStart("span", sId + "-" + "slide-number")
				.openEnd()
				.text(sTextBetweenNumbers)
				.close("span");
		}

		oRm.close("div");

		this._renderArrow(oRm, oControl, "next");

		oRm.close("div")
			.close("div")
			.close("div");
	};

	PaginatorRenderer._renderArrow = function (oRm, oControl, sDirection) {
		oRm.openStart("div")
			.class("sapMCrsl" + capitalize(sDirection.slice(0, 4)))
			.openEnd();

		oRm.openStart("div")
			.class("sapMCrslArrowInner")
			.openEnd();

		oRm.renderControl(oControl._getNavigationArrow(sDirection === "previous" ? "prev" : "next"));

		oRm.close("div")
			.close("div");
	};

	return PaginatorRenderer;

}, /* bExport= */ true);
