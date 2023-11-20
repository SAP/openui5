/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./PlaceholderBaseRenderer"], function(Renderer, PlaceholderBaseRenderer) {
	"use strict";

	/**
	 * TablePlaceholderRenderer renderer.
	 * @namespace
	 */
	var TablePlaceholderRenderer = Renderer.extend(PlaceholderBaseRenderer);

	TablePlaceholderRenderer.apiVersion = 2;

	/**
	 * CSS class to be applied to the HTML root element of the placeholder.
	 *
	 * @type {string}
	 */
	TablePlaceholderRenderer.CSS_CLASS_PLACEHOLDER = "sapFCardContentTablePlaceholder";

	TablePlaceholderRenderer.renderContent = function(oControl, oRm) {
		var iMinItems = oControl.getMinItems(),
			iColumns = oControl.getColumns();

		for (var i = 0; i < iMinItems + 1; i++) { // number of rows + header
			oRm.openStart("div")
				.class("sapFCardTablePlaceholderItem")
				.style("height", oControl.getItemHeight())
				.openEnd();

			oRm.openStart("div")
				.class("sapFCardTablePlaceholderRows")
				.openEnd();

				if (iColumns > 1) {
					for (var j = 0; j < iColumns; j++) {
						oRm.openStart("div")
						.class("sapFCardTablePlaceholderColumns")
						.class("sapFCardLoadingShimmer")
						.openEnd();
						oRm.close("div");
					}
				}

			oRm.close("div");
			oRm.close("div");
		}

	};

	TablePlaceholderRenderer.addOuterAttributes = function(oControl, oRm) {

		PlaceholderBaseRenderer.addOuterAttributes.apply(this, arguments);

		oRm.class(TablePlaceholderRenderer.CSS_CLASS_PLACEHOLDER);

	};

	return TablePlaceholderRenderer;

}, /* bExport= */ true);
