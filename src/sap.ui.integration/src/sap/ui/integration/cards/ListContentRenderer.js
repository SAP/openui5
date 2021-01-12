/*!
 * ${copyright}
 */

sap.ui.define(["./BaseContentRenderer"], function (BaseContentRenderer) {
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
	ListContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		if (!oConfiguration) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		if (!oConfiguration.maxItems || !oConfiguration.item) {
			return this.DEFAULT_MIN_HEIGHT;
		}

		var bIsCompact = this.isCompact(oContent),
			iCount = parseInt(oConfiguration.maxItems) || 0,
			oTemplate = oConfiguration.item,
			iItemHeight = bIsCompact ? 2 : 2.75; // list item height in "rem"

		if (oTemplate.description || oTemplate.chart) {
			iItemHeight = 5; // list item height with description or chart in "rem"
		}

		if (oTemplate.description && oTemplate.chart) {
			iItemHeight = 6; // list item height with description and chart in "rem"
		}

		return (iCount * iItemHeight) + "rem";
	};

	return ListContentRenderer;
});
