/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseContentRenderer",
	"../controls/ListContentItem"
], function (
	BaseContentRenderer,
	ListContentItem
) {
	"use strict";

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
	ListContentRenderer.getMinHeight = function (oConfiguration, oContent, oCard) {
		if (oContent._fMinHeight) {
			return oContent._fMinHeight + "px";
		}

		var iMinItems = oCard.getContentMinItems(oConfiguration),
			fItemHeight;

		if (!oConfiguration ||
			!oConfiguration.item ||
			iMinItems == null) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		fItemHeight = this.getItemMinHeight(oConfiguration, oContent);

		return (iMinItems * fItemHeight) + "rem";
	};

	ListContentRenderer.getItemMinHeight = function (oConfiguration, oContent) {
		if (!oConfiguration || !oConfiguration.item) {
			return 0;
		}

		var bIsCompact = this.isCompact(oContent),
			oTemplate = oConfiguration.item,
			fItemHeight = bIsCompact ? 2 : 2.75, // single line item height in "rem",
			fVerticalPadding = 0,
			iLines = ListContentItem.getLinesCount(oTemplate);

		if (iLines === 2) {
			fItemHeight = 5;
		} else if (iLines > 2) {
			fItemHeight = iLines + (iLines - 1) * 0.5; // lines + gaps
			fVerticalPadding = 2;
		}

		if (oTemplate.actionsStrip) {
			fItemHeight += bIsCompact ? 2 : 2.75; // actions strip height in "rem"
			fVerticalPadding += 0.5;

			if (iLines > 2) {
				fItemHeight += 0.5; // top margin of the actions strip
				fVerticalPadding = 1.5;
			}
		}

		fItemHeight += fVerticalPadding;

		return fItemHeight;
	};

	return ListContentRenderer;
});
