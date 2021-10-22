/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseContentRenderer",
	"../library"
], function (
	BaseContentRenderer,
	library
) {
	"use strict";

	var AttributesLayoutType = library.AttributesLayoutType;

	/**
	 * ListContentRenderer renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var ListContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.ListContentRenderer", {
		apiVersion: 2
	});

	/**
	 * @override
	 */
	ListContentRenderer.renderContent = function (oRm, oListContent) {
		oRm.renderControl(oListContent.getAggregation("_content"));

		if (oListContent.getAggregation("_legend")) {
			oRm.renderControl(oListContent.getAggregation("_legend"));
		}
	};

	/**
	 * @override
	 */
	ListContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		if (!oConfiguration || !oConfiguration.maxItems || !oConfiguration.item) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		var fItemHeight = this.getItemMinHeight(oConfiguration, oContent),
			iCount = parseInt(oConfiguration.maxItems) || 0;

		return (iCount * fItemHeight) + "rem";
	};

	ListContentRenderer.getItemMinHeight = function (oConfiguration, oControl) {
		if (!oConfiguration || !oConfiguration.item) {
			return 0;
		}

		var bIsCompact = this.isCompact(oControl),
			oTemplate = oConfiguration.item,
			fItemHeight = bIsCompact ? 1 : 1.125, // title height in "rem",
			fVerticalPadding = bIsCompact ? 1 : 1.625, // vertical padding in "rem"
			iAttrLength;

		if (oTemplate.icon && !oTemplate.description) {
			fVerticalPadding = bIsCompact ? 0 : 0.75;
			fItemHeight = 2;
		}

		if (oTemplate.description) {
			fVerticalPadding = 2;
			fItemHeight += bIsCompact ? 2 : 1.875;
		}

		if (oTemplate.attributes) {
			fVerticalPadding = 2.25;
			iAttrLength = oTemplate.attributes.length / 2;

			if (oTemplate.attributesLayoutType === AttributesLayoutType.OneColumn) {
				iAttrLength = oTemplate.attributes.length;
			}

			iAttrLength = Math.ceil(iAttrLength);
			fItemHeight += iAttrLength * 1.5; // attribute row height in "rem"
		}

		if (oTemplate.chart) {
			fItemHeight += 1; // chart height in "rem"
		}

		if (oTemplate.actionsStrip) {
			fVerticalPadding = 1;
			fItemHeight += bIsCompact ? 3 : 3.75; // actions strip height in "rem"
		}

		fItemHeight += fVerticalPadding;

		return fItemHeight;
	};

	return ListContentRenderer;
});
