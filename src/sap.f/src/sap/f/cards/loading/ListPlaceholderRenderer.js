/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./PlaceholderBaseRenderer"], function(Renderer, PlaceholderBaseRenderer) {
	"use strict";

	/**
	 * ListPlaceholderRenderer renderer.
	 * @namespace
	 */
	var ListPlaceholderRenderer = Renderer.extend(PlaceholderBaseRenderer);

	ListPlaceholderRenderer.apiVersion = 2;

	/**
	 * CSS class to be applied to the HTML root element of the placeholder.
	 *
	 * @type {string}
	 */
	ListPlaceholderRenderer.CSS_CLASS_PLACEHOLDER = "sapFCardContentListPlaceholder";

	ListPlaceholderRenderer.renderTitleAndDescription = function(oRm, oControl) {
		if (oControl.getAttributesLength() > 0 && oControl.getHasDescription()) {
			this.renderRow(oRm, true);
			return;
		}

		// Render mandatory title
		this.renderRow(oRm);

		if (oControl.getHasDescription()) {
			this.renderRow(oRm);
		}
	};

	ListPlaceholderRenderer.renderRow = function (oRm, bCombined) {
		oRm.openStart("div")
			.class("sapFCardListPlaceholderRow")
			.class("sapFCardLoadingShimmer");

		if (bCombined) {
			oRm.class("sapFCardListPlaceholderRowCombined");
		}

		oRm.openEnd()
			.close("div");
	};

	ListPlaceholderRenderer.renderAttributes = function (oRm, iAttributesLength) {
		if (iAttributesLength < 1) {
			return;
		}

		var iAttrRows = Math.floor(iAttributesLength / 2 + 1);

		for (var j = 0; j < iAttrRows; j++) {
			oRm.openStart("div")
				.class("sapFCardListPlaceholderRow")
				.openEnd();

			var iAttrPerRow = j === iAttrRows - 1 ? 1 : 2; // render single attribute on the last row

			for (var i = 0; i < iAttrPerRow; i++) {
				oRm.openStart("div")
					.class("sapFCardListPlaceholderAttr")
					.class("sapFCardLoadingShimmer")
					.openEnd()
					.close("div");
			}
			oRm.close("div");
		}

	};

	ListPlaceholderRenderer.renderContent = function(oControl, oRm) {
		var iMinItems = oControl.getMinItems();

		for (var i = 0; i < iMinItems; i++) {
			oRm.openStart("div")
				.class("sapFCardListPlaceholderItem")
				.style("height", oControl.getItemHeight())
				.openEnd();

			if (oControl.getHasIcon()) {
				oRm.openStart("div")
					.class("sapFCardListPlaceholderImg")
					.class("sapFCardLoadingShimmer")
					.openEnd()
					.close("div");
			}

			oRm.openStart("div")
				.class("sapFCardListPlaceholderRows")
				.openEnd();

			this.renderTitleAndDescription(oRm, oControl);

			this.renderAttributes(oRm, oControl.getAttributesLength());

			if (oControl.getHasChart()) {
				this.renderRow(oRm);
			}

			if (oControl.getHasActionsStrip()) {
				this.renderRow(oRm);
			}

			oRm.close("div");
			oRm.close("div");
		}

	};

	ListPlaceholderRenderer.addOuterAttributes = function(oControl, oRm) {

		PlaceholderBaseRenderer.addOuterAttributes.apply(this, arguments);

		oRm.class(ListPlaceholderRenderer.CSS_CLASS_PLACEHOLDER);

	};

	return ListPlaceholderRenderer;

}, /* bExport= */ true);
