/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./PlaceholderBaseRenderer"], function(Renderer, PlaceholderBaseRenderer) {
	"use strict";

	/**
	 * CalendarPlaceholderRenderer renderer.
	 * @namespace
	 */
	var CalendarPlaceholderRenderer = Renderer.extend(PlaceholderBaseRenderer);

	CalendarPlaceholderRenderer.apiVersion = 2;

	/**
	 * CSS class to be applied to the HTML root element of the placeholder.
	 *
	 * @type {string}
	 */
	CalendarPlaceholderRenderer.CSS_CLASS_PLACEHOLDER = "sapFCardContentCalendarPlaceholder";

	CalendarPlaceholderRenderer.renderTextRow = function(oRm) {
		oRm.openStart("div")
			.class("sapFCardListPlaceholderRow")
			.class("sapFCardListPlaceholderTextRow")
			.class("sapFCardLoadingShimmer");

		oRm.openEnd()
			.close("div");
	};

	CalendarPlaceholderRenderer.renderRow = function (oRm, bCombined) {
		oRm.openStart("div")
			.class("sapFCardListPlaceholderRow")
			.class("sapFCardLoadingShimmer");

		if (bCombined) {
			oRm.class("sapFCardListPlaceholderRowCombined");
		}

		oRm.openEnd()
			.close("div");
	};

	CalendarPlaceholderRenderer.renderContent = function(oControl, oRm) {
		var iMinItems = oControl.getMinItems(),
		iMaxLegendItems = oControl.getMaxLegendItems(),
		oItem = oControl.getItem(),
		oLegendItem = oControl.getLegendItem(),
		i;

		// open left side
		oRm.openStart("div")
			.class("sapFCalCardPlaceholderLeftSide")
			.attr("tabindex", "0");

		oRm.openEnd();

		// open calendar part
		oRm.openStart("div")
			.class("sapFCardContentCalendarPartPlaceholder")
			.class("sapFCardLoadingShimmer")
			.attr("tabindex", "0");

		oRm.openEnd();

		// close calendar part
		oRm.close("div");

		// open legend items part
		oRm.openStart("div")
			.class("sapFCardContentListPlaceholder")
			.class("sapFCardContentLegendItemsListPlaceholder")
			.attr("tabindex", "0");

		oRm.openEnd();

		for (i = 0; i < iMaxLegendItems; i++) {
			oRm.openStart("div")
				.class("sapFCardListPlaceholderLegendItem")
				.class("sapFCardListPlaceholderItem")
				.style("height", oControl.getItemHeight())
				.openEnd();

			if (oLegendItem) {
				oRm.openStart("div")
					.class("sapFCardListPlaceholderImg")
					.class("sapFCardLoadingShimmer")
					.openEnd()
					.close("div");

				oRm.openStart("div")
					.class("sapFCardListPlaceholderRows")
					.openEnd();
				this.renderRow(oRm);
				oRm.close("div");
			}

			oRm.close("div");
		}

		// close legend items part
		oRm.close("div");

		// close left side
		oRm.close("div");

		// open right side
		oRm.openStart("div")
			.class("sapFCardContentListPlaceholder")
			.class("sapFCardContentItemsListPlaceholder")
			.class("sapFCalCardPlaceholderRightSide")
			.attr("tabindex", "0");

		oRm.openEnd();

		for (i = 0; i < iMinItems; i++) {
			oRm.openStart("div")
				.class("sapFCardListPlaceholderItem")
				.style("height", oControl.getItemHeight())
				.openEnd();

			oRm.openStart("div")
				.class("sapFCardListPlaceholderFromTo")
				.class("sapFCardLoadingShimmer")
				.openEnd()
				.close("div");

			oRm.openStart("div")
				.class("sapFCardListPlaceholderRows")
				.openEnd();

			if (oItem) {
				if (oItem.title) {
					this.renderRow(oRm);
				}

				if (oItem.text) {
					this.renderTextRow(oRm);
				}
			}

			oRm.close("div");
			oRm.close("div");
		}
		// close right side
		oRm.close("div");
	};

	CalendarPlaceholderRenderer.addOuterAttributes = function(oControl, oRm) {

		PlaceholderBaseRenderer.addOuterAttributes.apply(this, arguments);

		oRm.class(CalendarPlaceholderRenderer.CSS_CLASS_PLACEHOLDER);

	};

	return CalendarPlaceholderRenderer;

}, /* bExport= */ true);
