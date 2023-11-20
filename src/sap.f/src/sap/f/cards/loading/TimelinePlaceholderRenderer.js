/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./PlaceholderBaseRenderer"], function(Renderer, PlaceholderBaseRenderer) {
	"use strict";

	/**
	 * TimelinePlaceholderRenderer renderer.
	 * @namespace
	 */
	var TimelinePlaceholderRenderer = Renderer.extend(PlaceholderBaseRenderer);

	TimelinePlaceholderRenderer.apiVersion = 2;

	/**
	 * CSS class to be applied to the HTML root element of the placeholder.
	 *
	 * @type {string}
	 */
	TimelinePlaceholderRenderer.CSS_CLASS_PLACEHOLDER = "sapFCardContentTimelinePlaceholder";

	TimelinePlaceholderRenderer.renderRow = function(oRm, iWidth) {
		oRm.openStart("div")
			.class("sapFCardTimelinePlaceholderRow")
			.class("sapFCardTimelinePlaceholderRow" + iWidth)
			.class("sapFCardLoadingShimmer")
			.openEnd()
			.close("div");
	};

	TimelinePlaceholderRenderer.renderContent = function(oControl, oRm) {
		var iMinItems = oControl.getMinItems(),
					oItem = oControl.getItem();

		for (var i = 0; i < iMinItems; i++) {
			oRm.openStart("div")
				.class("sapFCardTimelinePlaceholderItem")
				.style("height", oControl.getItemHeight())
				.openEnd();

			if (oItem) {
				oRm.openStart("div")
					.class("sapFCardTimelineNavGroup")
					.openEnd();

				oRm.openStart("div")
					.class("sapFCardTimelinePlaceholderImg")
					.class("sapFCardLoadingShimmer")
					.openEnd()
					.close("div");

				if (i !== iMinItems - 1) {
					oRm.openStart("div")
						.class("sapFCardTimelinePlaceholderLine")
						.class("sapFCardLoadingShimmer")
						.openEnd()
						.close("div");
				}

				oRm.close("div");
			}

			oRm.openStart("div")
				.class("sapFCardTimelinePlaceholderRows")
				.openEnd();

			if (oItem) {
				this.renderRow(oRm, 100);
				this.renderRow(oRm, 40);
				this.renderRow(oRm, 60);
			}

			oRm.close("div");
			oRm.close("div");
		}
	};

	TimelinePlaceholderRenderer.addOuterAttributes = function(oControl, oRm) {

		PlaceholderBaseRenderer.addOuterAttributes.apply(this, arguments);

		oRm.class(TimelinePlaceholderRenderer.CSS_CLASS_PLACEHOLDER);

	};

	return TimelinePlaceholderRenderer;

}, /* bExport= */ true);
