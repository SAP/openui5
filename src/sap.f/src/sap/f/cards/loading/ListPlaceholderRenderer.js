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

	ListPlaceholderRenderer.renderTitleAndDescription = function(oRm, oItem) {
		if (oItem.attributes && oItem.title && oItem.description) {
			this.renderRow(oRm, true);
			return;
		}

		if (oItem.title) {
			this.renderRow(oRm);
		}

		if (oItem.description) {
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

	ListPlaceholderRenderer.renderAttributes = function (oRm, oItem) {
		if (!oItem.attributes) {
			return;
		}

		var iAttrRows = oItem.attributes.length / 2 + 1;

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
		var iMinItems = oControl.getMinItems(),
			oItem = oControl.getItem();

		for (var i = 0; i < iMinItems; i++) {
			oRm.openStart("div")
				.class("sapFCardListPlaceholderItem")
				.style("height", oControl.getItemHeight())
				.openEnd();

			if (oItem && oItem.icon) {
				oRm.openStart("div")
					.class("sapFCardListPlaceholderImg")
					.class("sapFCardLoadingShimmer")
					.openEnd()
					.close("div");
			}

			oRm.openStart("div")
				.class("sapFCardListPlaceholderRows")
				.openEnd();

			if (oItem) {
				this.renderTitleAndDescription(oRm, oItem);
				this.renderAttributes(oRm, oItem);

				if (oItem.chart) {
					this.renderRow(oRm);
				}

				if (oItem.actionsStrip) {
					this.renderRow(oRm);
				}
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
